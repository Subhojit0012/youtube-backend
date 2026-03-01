import { router, mergeRouters } from "./../utility/context.utility.js";
import { userRouter } from "./user.route.js";

export const appRouter = mergeRouters(userRouter);

export type AppRouter = typeof appRouter;
