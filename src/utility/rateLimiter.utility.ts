import { createClient } from "redis";
import type { RedisClientType, RedisArgument } from "redis";
import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const client = createClient({
  url: process.env.REDIS_URL as string,
});

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

client.connect();

// Lua script for atomic token bucket operations
const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local refill_interval = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

-- Get current state or initialize
local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

-- Initialize if this is the first request
if tokens == nil then
    tokens = capacity
    last_refill = now
end

-- Calculate token refill
local time_passed = now - last_refill
local refills = math.floor(time_passed / refill_interval)

if refills > 0 then
    tokens = math.min(capacity, tokens + (refills * refill_rate))
    last_refill = last_refill + (refills * refill_interval)
end

-- Try to consume a token
local allowed = 0
if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
end

-- Update state
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)

-- Return result: allowed (1 or 0) and remaining tokens
return {allowed, tokens}
`;

class TokenBucket {
  /**
   * Create a new TokenBucket rate limiter.
   *
   * @param {Object} options - Configuration options.
   * @param {number} [options.capacity=10] - Maximum number of tokens in the bucket.
   * @param {number} [options.refillRate=1] - Number of tokens added per refill interval.
   * @param {number} [options.refillInterval=1.0] - Time in seconds between refills.
   * @param {import('redis').RedisClientType} [options.redisClient] - Redis client instance.
   */
  public constructor(options: {
    client: RedisClientType;
    refillRate: 1;
    refillInterval: 0.1;
    capacity: 10;
  }) {
    this.redisClient = options.client;
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;
    this.refillInterval = options.refillInterval;
    this._scriptLoaded = false;
    this._scriptSha = crypto
      .createHash("sha1")
      .update(TOKEN_BUCKET_SCRIPT)
      .digest("hex");
  }
  redisClient;
  refillInterval;
  capacity;
  refillRate;
  private _scriptLoaded;
  private _scriptSha;

  /**
   * Ensure the Lua script is loaded into Redis.
   * @private
   */
  private async ensureScriptLoaded() {
    if (!this._scriptLoaded) {
      try {
        this._scriptSha =
          await this.redisClient.scriptLoad(TOKEN_BUCKET_SCRIPT);
        this._scriptLoaded = true;
      } catch (error) {
        throw error;
      }
    }
  }

  /**
   * Check if a request should be allowed for the given key.
   *
   * @param {string} key - The rate limit key (e.g., 'user:123', 'api:endpoint:xyz').
   * @returns {Promise<{allowed: boolean, remaining: number}>} Result with allowed status and remaining tokens.
   *
   * @example
   * const { allowed, remaining } = await limiter.allow('user:123');
   * console.log(`Allowed: ${allowed}, Remaining: ${remaining}`);
   */
  async allow(key: RedisArgument) {
    await this.ensureScriptLoaded();

    const currentTime = Math.floor(Date.now() / 1000);

    let result: any;

    try {
      // Try EVALSHA first (faster if script is cached)
      result = await this.redisClient.evalSha(this._scriptSha, {
        keys: [key],
        arguments: [
          String(this.capacity),
          String(this.refillRate),
          String(this.refillInterval),
          String(currentTime),
        ],
      });
    } catch (error) {
      if (error.message && error.message.includes("NOSCRIPT")) {
        // Script not in cache, use EVAL and reload
        result = await this.redisClient.eval(TOKEN_BUCKET_SCRIPT, {
          keys: [key],
          arguments: [
            String(this.capacity),
            String(this.refillRate),
            String(this.refillInterval),
            String(currentTime),
          ],
        });
        this._scriptLoaded = false;
      } else {
        throw error;
      }
    }

    const allowed = Boolean(result[0]);
    const remaining = Number(result[1]);

    return { allowed, remaining };
  }
}

export { TokenBucket, TOKEN_BUCKET_SCRIPT };

// rate-limiter middlewre:

function rateLimitMiddleware(
  limiter: TokenBucket,
  fn: (param: Request) => string,
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const key = fn(req);
    const { allowed, remaining } = await limiter.allow(key);

    // Add standard rate limit headers
    res.set("X-RateLimit-Limit", String(limiter.capacity));
    res.set("X-RateLimit-Remaining", String(Math.floor(remaining)));
    res.set(
      "X-RateLimit-Reset",
      String(Math.floor(Date.now() / 1000 + limiter.refillInterval)),
    );

    if (!allowed) {
      res.set("Retry-After", String(Math.ceil(limiter.refillInterval)));
      res.status(429).json({ error: "Too Many Requests" });
      return;
    }

    next();
  };
}

export { rateLimitMiddleware };
