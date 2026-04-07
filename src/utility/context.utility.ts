import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC, TRPCError } from "@trpc/server";
import { decodeToken, encodeToken } from "./token.utility.js";
import type { JwtPayload } from "jsonwebtoken";

export interface ContextOption extends Partial<trpcExpress.CreateExpressContextOptions> {
  token?: string | null;
}

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions): ContextOption => {
  const token: string =
    req.headers.authorization?.split(" ")[1]?.toString() || "";
  
  if (token) {
    return { req, res, token: token };
  }

  return { req, res };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;
