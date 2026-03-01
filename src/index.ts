import "dotenv/config";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { connectDB } from "./db/connect.db.js";
import type { Express } from "express";
import { appRouter } from "./router/_app.router.js";
import { createContext } from "./utility/context.utility.js";
import sessionRouter from "./utility/session.js";
import { initRedisClient } from "./utility/session.js";
import {
  createDefaultLogger,
  createRequestLogger,
} from "./utility/log.utility.js";

export const app: Express = express();
const logger = createDefaultLogger().child({ service: "trpc-backend" });

app.use(createRequestLogger(logger));
app.use("/express", express.urlencoded({ extended: true }));
app.use("/express", express.json());

app.use("/express/test", sessionRouter);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

(async function () {
  try {
    logger.info("starting server bootstrap");
    initRedisClient();
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

process.on("exit", (code) => {
  logger.warn("process exit", { code });
});
