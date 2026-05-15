import { Playlist } from "../db/models/playlist.model.js";
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

async function deletePlaylist(opts: CreatePlaylistOpts) {
  // delete the playlist Id
  const {input, ctx} = opts
  
  const playlist = await Playlist.findByIdAndDelete(input.playListId);

  if(!playlist) throw new Error("PLAYLIST NOT FOUND");

  if(playlist.owner.toString() !== ctx.payload?.id.toString()) throw new Error("UNAUTHORIZED");

  return {message: "Playlist deleted successfully"};
}
