import { authProcedure } from "../utility/context.utility.js";
import { router } from "../utility/context.utility.js";
import z from "zod";
import { historyService, getHistory} from "../service/history.service.js";

const historyRouter = router({
    addToHistory: authProcedure.input(
        z.object({
            videoId: z.string(),
        }),
    ).mutation(async ({ input, ctx }) => {
        const { videoId } = input;
        const userId =
            typeof ctx.payload === "object" && ctx.payload !== null
                ? (ctx.payload as {id: string}).id
                : undefined;
        if (!userId) {
            throw new Error("UNAUTHORIZED");
        }
        await historyService(userId, videoId);
        return { message: "Video added to history" };
    }),

    getHistory: authProcedure.query(async ({ ctx }) => {
        const userId =
            typeof ctx.payload === "object" && ctx.payload !== null
                ? (ctx.payload as {id: string}).id
                : undefined;
        if (!userId) {
            throw new Error("UNAUTHORIZED");
        }
        return await getHistory(userId);
    }),
});

export default historyRouter;