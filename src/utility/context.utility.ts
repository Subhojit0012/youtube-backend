import * as trpcExpress from "@trpc/server/adapters/express";
import { initTRPC } from "@trpc/server";
import { ota } from "zod/v4/locales";
import { read } from "node:fs";
import { decodeToken } from "./token.utility.js";

interface ContextOption {
  req: trpcExpress.CreateExpressContextOptions["req"];
  res: trpcExpress.CreateExpressContextOptions["res"];
  info?: trpcExpress.CreateExpressContextOptions["info"];
  user?: object | string | null;
}

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions): ContextOption => {
  const auth: string =
    req.headers.authorization?.split(" ")[1]?.toString() || "";
  const decode = decodeToken(auth);

  if (decode) {
    return { req, res, user: decode };
  }

  return { req, res };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

interface CreateInnerContextOptions extends Partial<trpcExpress.CreateExpressContextOptions> {
  session: object | null;
}

function createInnerContext(opts: CreateInnerContextOptions) {
  return {
    session: opts.session,
    id: 1,
  };
}
