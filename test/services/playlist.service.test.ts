import { describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { Playlist } from "../../src/db/models/playlist.model.js";
import { createPlaylist } from "../../src/service/playlist.service.js";

describe("playlist service", () => {
  it("creates a playlist when the user has none", async () => {
    vi.spyOn(Playlist, "findOne").mockResolvedValue(null);
    const create = vi
      .spyOn(Playlist, "createPlaylist" as never)
      .mockResolvedValue(undefined as never);

    const userId = new mongoose.Types.ObjectId();
    await createPlaylist({
      input: { name: "Watch later", videoId: new mongoose.Types.ObjectId() },
      ctx: { payload: { id: userId } },
    });

    expect(create).toHaveBeenCalledWith("Watch later", userId);
  });
});
