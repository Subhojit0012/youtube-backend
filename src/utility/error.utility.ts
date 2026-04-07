import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";

const error: TRPCError = {
  name: "TRPCError",
  code: "INTERNAL_SERVER_ERROR",
  message: "Database connection failed",
};

if (error instanceof TRPCError) {
  const httpCode = getHTTPStatusCodeFromError(error);
  console.error(httpCode);
}

export { error };
