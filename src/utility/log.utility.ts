import { format } from "util";
import type { NextFunction, Request, Response } from "express";

export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: LogMetadata;
}

export interface LogSink {
  write(entry: LogEntry): void;
}

export interface LogFormatter {
  format(entry: LogEntry): string;
}

export interface ILogger {
  debug(message: string, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
  error(message: string, metadata?: LogMetadata): void;
  child(defaultMetadata: LogMetadata): ILogger;
}

const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// formatter classes
class JsonLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }
}

class PrettyLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const metadata =
      entry.metadata && Object.keys(entry.metadata).length > 0
        ? ` ${JSON.stringify(entry.metadata)}`
        : "";

    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message}${metadata}`;
  }
}

// sink class
class ConsoleSink implements LogSink {
  constructor(private readonly formatter: LogFormatter) {

  }

  write(entry: LogEntry): void {
    const payload = this.formatter.format(entry);

    if (entry.level === "error") {
      console.error(payload);
      return;
    }

    if (entry.level === "warn") {
      console.warn(payload);
      return;
    }

    console.log(payload);
  }
}

interface LoggerOptions {
  minLevel?: LogLevel;
  sink?: LogSink;
  defaultMetadata?: LogMetadata;
}

export class Logger implements ILogger {
  private readonly minLevel: LogLevel;
  private readonly sink: LogSink;
  private readonly defaultMetadata: LogMetadata;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? "info";
    this.sink = options.sink ?? new ConsoleSink(new PrettyLogFormatter());
    this.defaultMetadata = options.defaultMetadata ?? {};
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log("error", message, metadata);
  }

  child(defaultMetadata: LogMetadata): ILogger {
    return new Logger({
      minLevel: this.minLevel,
      sink: this.sink,
      defaultMetadata: { ...this.defaultMetadata, ...defaultMetadata },
    });
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(level)) {
      return;
    }

    this.sink.write({
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: { ...this.defaultMetadata, ...(metadata ?? {}) },
    });
  }

  // boolean check.
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.minLevel];
  }
}

function getClientIp(req: Request): string {
  const xForwardedFor = req.headers["x-forwarded-for"];

  if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
    const [firstIp = "unknown"] = xForwardedFor.split(",");
    return firstIp.trim();
  }

  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0] ?? "unknown";
  }

  return req.socket.remoteAddress ?? "unknown";
}

export function createRequestLogger(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const endedAt = process.hrtime.bigint();
      const latencyMs = Number(endedAt - startedAt) / 1000000;
      const level: LogLevel =
        res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      const message = format("%s %s -> %d", req.method, req.originalUrl, res.statusCode);

      logger[level](message, {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        latencyMs: Number(latencyMs.toFixed(2)),
        ip: getClientIp(req),
        userAgent: req.get("user-agent"),
      });
    });

    next();
  };
}

export function createDefaultLogger(): ILogger {
  const minLevel =
    process.env.LOG_LEVEL && LOG_LEVELS.includes(process.env.LOG_LEVEL as LogLevel)
      ? (process.env.LOG_LEVEL as LogLevel)
      : "info";

  const formatter: LogFormatter =
    process.env.LOG_FORMAT === "json" ? new JsonLogFormatter() : new PrettyLogFormatter();

  return new Logger({
    minLevel,
    sink: new ConsoleSink(formatter),
  });
}