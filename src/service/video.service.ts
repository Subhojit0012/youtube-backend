import { TRPCError } from "@trpc/server";
import { Video } from "../db/models/video.model.js";

export async function createVideoModel(input: object, userId?: string) {
  const { title, description, videoFile, thumbnail } = input as {
    title: string;
    description: string;
    videoFile: string;
    thumbnail: string;
  };

  const id = userId ? userId : undefined;

  const video = await Video.create({
    title,
    description,
    videoFile,
    thumbnail,
    // owner property is having issue
  });

  if (!video) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create video model",
    });
  }
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

  if (!videos) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No videos found for this user",
    });
  }

  return videos;
}
export async function getAllVideos() {}

export async function deleteVideoById(videoId: string, userId?: string) {
  if (!videoId)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Video ID is required",
    });

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Video not found",
      });
    }

    if (userId && video.owner.toString() !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this video",
      });
    }

    await Video.findByIdAndDelete(videoId);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete video",
    });
  }
}
