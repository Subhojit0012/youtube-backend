import { describe, expect, it, vi } from "vitest";
import { Video } from "../../src/db/models/video.model.js";
import {
  createVideoModel,
  deleteVideoById,
  getVideoById,
} from "../../src/service/video.service.js";

describe("video service", () => {
  it("creates a video with its owner", async () => {
    const create = vi.spyOn(Video, "create").mockResolvedValue({ _id: "video-id" } as never);

    await createVideoModel(
      {
        title: "Video",
        description: "Description",
        videoFile: "video.mp4",
        thumbnail: "thumbnail.jpg",
      },
      "user-id",
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Video", owner: "user-id" }),
    );
  });

  it("rejects a missing video id", async () => {
    await expect(getVideoById("")).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("gets a video by id", async () => {
    vi.spyOn(Video, "findById").mockResolvedValue({ _id: "video-id" } as never);

    await expect(getVideoById("video-id")).resolves.toMatchObject({
      _id: "video-id",
    });
  });

  it("rejects deletion by a non-owner", async () => {
    vi.spyOn(Video, "findById").mockResolvedValue({
      _id: "video-id",
      owner: { toString: () => "owner-id" },
    } as never);

    await expect(deleteVideoById("video-id", "other-id")).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});
