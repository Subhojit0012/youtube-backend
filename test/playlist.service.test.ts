import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { Playlist } from "../src/db/models/playlist.model.js";
import { createPlaylist } from "../src/service/playlist.service.js";

test("createPlaylist creates a playlist when the user has none", async (t) => {
  const owner = new mongoose.Types.ObjectId();
  const videoId = new mongoose.Types.ObjectId();
  const createPlaylistMock = t.mock.method(
    Playlist,
    "createPlaylist",
    async () => undefined,
  );

  t.mock.method(Playlist, "findOne", async () => null);

  await createPlaylist({
    input: { name: "Watch later", videoId },
    ctx: { payload: { id: owner } },
  });

  assert.equal(createPlaylistMock.mock.callCount(), 1);
  assert.deepEqual(createPlaylistMock.mock.calls[0]?.arguments, [
    "Watch later",
    owner,
  ]);
});