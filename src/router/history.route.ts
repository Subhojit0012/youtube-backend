import { authProcedure } from "../utility/context.utility.js";
import { router } from "../utility/context.utility.js";
import z from "zod";
import { getHistory, addToHistory } from "../service/history.service.js";
import { TRPCError } from "@trpc/server";

const historyRouter = router({
  addToHistory: authProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const userId =
        typeof ctx.payload === "object" && ctx.payload !== null
          ? (ctx.payload as { id: string }).id
          : undefined;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }
      await addToHistory(userId, videoId);

      return { message: "Video added to history"};
    }),

  getHistory: authProcedure.query(async ({ ctx }) => {
    const userId =
      typeof ctx.payload === "object" && ctx.payload !== null
        ? (ctx.payload as { id: string }).id
        : undefined;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
    }

    const history = await getHistory(userId);

    return { history };
  }),
});

export default historyRouter;
