import { procedure } from "../utility/context.utility.js";
import { router } from "../utility/context.utility.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Video } from "../db/models/video.model.js";
import { createVideoModel, getVideoById } from "../service/video.service.js";

const videoRouter = router({
  uploadVideo: procedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        videoFile: z.string(),
        thumbnail: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId =
          typeof ctx.payload === "object" ? ctx.payload?._id : null;

        // create video model and save to database
        createVideoModel(input, userId);

        return {
          message: "Video uploaded successfully",
        };
      } catch (error) {
        throw error instanceof TRPCError ? error : "Failed to upload video";
      }
    }),
  getVideoById: procedure.input(z.string()).query(async ({ input }) => {
    const value = await getVideoById(input);

    if (value instanceof TRPCError) throw value;

    return value;
  }),
});

export default videoRouter;
