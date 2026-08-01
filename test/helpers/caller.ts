import jwt from "jsonwebtoken";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createCallerFactory } from "../../src/utility/context.utility.js";
import { appRouter } from "../../src/router/_app.router.js";

const createCaller = createCallerFactory(appRouter);

export function createTestCaller(userId?: string) {
  const token = userId
    ? jwt.sign({ id: userId }, process.env.JWT_SECRET ?? "test-jwt-secret")
    : undefined;

  const context = {
    req: { headers: token ? { authorization: `Bearer ${token}` } : {} },
    res: {
      setHeader() {
        return;
      },
    },
    ...(token ? { token } : {}),
  } as CreateExpressContextOptions & { token?: string };

  return createCaller(context);
}
