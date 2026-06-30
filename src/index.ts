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
import router from "./router/auth.router.js";

export const app: Express = express();

const logger = createDefaultLogger().child({ service: "trpc-backend" });

app.use(createRequestLogger(logger));

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
  logger.info("starting server bootstrap");
  // await initRedisClient();
  connectDB()
    .then(() =>
      app.listen(2026, () => {
        logger.info("server running", { port: 2026 });
      }),
    )
    .catch((err) => {
      logger.error("failed to start server", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
})();

// exit code
process.on("exit", (code) => {
  logger.warn("process exit", { code });
});
