import type { JwtPayload } from "jsonwebtoken";
import { Playlist } from "../db/models/playlist.model.js";
import type { mongo, ObjectId } from "mongoose";
import mongoose from "mongoose";

interface CreatePlaylistOpts {
  input: {
    videoId: mongoose.Types.ObjectId;
    playListId?: mongoose.Types.ObjectId;
    name: string;
  };
  ctx: {
    payload: {
      id: mongoose.Types.ObjectId;
    };
  };
}
// check if the playlist is exists for the user
// if exits then add the video to the
async function createPlaylist(opts: CreatePlaylistOpts) {
  const { input, ctx } = opts;

  let checkPlaylist = await checkUserPlaylist(ctx.payload?.id);

  if (checkPlaylist) {
    checkPlaylist.addToPlaylist(input.videoId, ctx.payload?.id);
  }

  // create a new playlist
  await Playlist.createPlaylist(input.name, ctx.payload?.id);
}

export { createPlaylist };

async function checkUserPlaylist(userId: mongoose.Types.ObjectId) {
  const playlist = await Playlist.findOne({ owner: userId });

  if (playlist) return playlist;

  return false;
}
