import { mergeRouters } from "./../utility/context.utility.js";
import { userRouter } from "./user.route.js";
import playListRouter from "./playlist.route.js";
import videoRouter from "./video.route.js";

export const appRouter = mergeRouters(userRouter, playListRouter, videoRouter);

export type AppRouter = typeof appRouter;
