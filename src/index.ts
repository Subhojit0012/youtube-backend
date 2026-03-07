import "dotenv/config";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { connectDB } from "./db/connect.db.js";
import type { Express } from "express";
import { appRouter } from "./router/_app.router.js";
import { createContext } from "./utility/context.utility.js";
import {
  createDefaultLogger,
  createRequestLogger,
} from "./utility/log.utility.js";
import session from "express-session";
import { redisStore } from "./utility/session.js";


export const app: Express = express();

const logger = createDefaultLogger().child({ service: "trpc-backend" });

app.use(createRequestLogger(logger));
app.use("/express", express.json());
app.use("/express", express.urlencoded({ extended: true }));
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24
  }
}))


// rpc route
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// server bootstrap
(async function () {
  try {
    logger.info("starting server bootstrap");
    // await initRedisClient();
    connectDB().then(() =>
      app.listen(2026, () => {
        logger.info("server running", { port: 2026 });
      }),
    );
  } catch (error) {
    logger.error("failed to start server", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
})();

// exit code
process.on("exit", (code) => {
  logger.warn("process exit", { code });
});
