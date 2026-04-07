import { TRPCError } from "@trpc/server";
import { Video } from "../db/models/video.model.js";

export function createVideoModel(input: object, userId?: string) {
  const { title, description, videoFile, thumbnail } = input as {
    title: string;
    description: string;
    videoFile: string;
    thumbnail: string;
  };

  const id = userId ? userId : undefined;

  const video = new Video({
    title,
    description,
    videoFile,
    thumbnail,
    owner: id,
  });

  if (!video) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create video model",
    });
  }

  return video;
}

export async function getVideoById(id: string) {
  if (!id)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Video ID is required",
    });

  try {
    return await Video.findById(id);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch video",
    });
  }
}

export async function getAllVideosOfUser(userId: string) {
  const videos = await Video.findById({ owner: userId });
}
export async function getAllVideos() {}
export async function deleteVideoById(videoId: string, userId?: string) {}
