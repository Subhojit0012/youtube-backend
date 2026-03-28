import { procedure } from "../utility/context.utility.js";
import { router } from "../utility/context.utility.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Video } from "../db/models/video.model.js";

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
      const { title, description, videoFile, thumbnail } = input;

      const userId = typeof ctx.payload === "object" ? ctx.payload?._id : null;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to upload video",
        });
      }

      const video = await Video.create({
        title,
        description,
        videoFile,
        thumbnail,
        owner: userId,
      });

      if (!video) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload video",
        });
      }

      return {
        message: "Video uploaded successfully",
      };
    }),
    getVideoById: procedure.input(z.string()).query(async ({input})=>{
        const id = input;

        const video = await Video.findById(id);

        if(!video){
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Video not found"
            })
        }

        return video;
    }),
});

export default videoRouter;
