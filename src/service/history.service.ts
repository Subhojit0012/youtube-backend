import { History } from "../db/models/history.model.js";
import { TRPCError } from "@trpc/server";

async function historyService(userId: string, videoId: string) {
  // first check if the video is already included in history if yes then update the timestamps
  // if not then add it to the history

  const history = await History.findOne({ userId });

  const video = history?.videoId.find((item) => item.toString() === videoId);

  if(!video){
    throw new TRPCError({code: "BAD_REQUEST", message: "Invalid input"});
  }
};

async function getHistory(userId: string){
  const history = await History.findOne({ userId }).populate({
    path: "videoId",
    select: "title thumbnail duration owner",
    populate: {
      path: "owner",
      select: "name avatar",
    },
  });

  if (!history) {
    return [];
  }

  return history.videoId;
}

export {historyService, getHistory};
