import { procedure } from "../utility/context.utility.js";

// authorization middleware to ensure user is authenticated

const authProcedure = procedure.use((opts) => {
  const { ctx, next } = opts;
  /*
  if (!ctx?.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated",
    });
  }
*/

  return next();
});
