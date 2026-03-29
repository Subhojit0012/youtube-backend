import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC, TRPCError } from "@trpc/server";
import { decodeToken } from "./token.utility.js";
import type { JwtPayload } from "jsonwebtoken";

export interface ContextOption extends Partial<trpcExpress.CreateExpressContextOptions> {
  payload?: JwtPayload | string | null;
}

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions): ContextOption => {
  const auth: string = req.headers.authorization?.split(" ")[1]?.toString() || "";
  const decode = decodeToken(auth);

  if (decode) {
    return { req, res, payload: decode };
  }

  return { req, res };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

// set inner context for session
// interface CreateInnerContextOptions extends Partial<trpcExpress.CreateExpressContextOptions> {
//   session?: object | null;
//   token?: string | JwtPayload | undefined;
// }

// function createInnerContext(opts: CreateInnerContextOptions) {}
