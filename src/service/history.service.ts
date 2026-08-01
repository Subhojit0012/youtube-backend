import { History } from "../db/models/history.model.js";
import { TRPCError } from "@trpc/server";

async function historyService(userId: string, videoId: string) {
  // first check if the video is already included in history if yes then update the timestamps
  // if not then add it to the history

  const history = await History.findOne({ userId });

  const video = history?.videoId.find((item) => item.toString() === videoId);

  if (!video) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input" });
  }
}

export async function addToHistory(userId: string, videoId: string) {
  const existingHistory = await History.findOne({ userId });

  if (!existingHistory) {
    // If no history exists for this user, create a new one
    const newHistory = new History({
      userId,
      videoId: [videoId],
    });
    await newHistory.save();
    return;
  }

  // Check if the video is already in the history
  const videoIndex = existingHistory.videoId.findIndex(
    (id) => id.toString() === videoId,
  );

  if (videoIndex !== -1) {
    // If video exists, move it to the front (most recent)
    const [video] = existingHistory.videoId.splice(videoIndex, 1);
    existingHistory.videoId.unshift(video as any);
  } else {
    // If video doesn't exist, add it to the front
    existingHistory.videoId.unshift(videoId as any);
  }

  // Save the updated history
  await existingHistory.save();
}

async function getHistory(userId: string) {
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

export { historyService, getHistory };
