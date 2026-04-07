import type { JwtPayload } from "jsonwebtoken";
import { Playlist } from "../db/models/playlist.model.js";
import type { ObjectId } from "mongoose";

interface Playlist {
  input: {
    videoId: string | ObjectId;
    playListId?: string | ObjectId;
    name?: string;
  };
  ctx: {
    payload: {
      id: string | ObjectId;
    };
  };
}

function playlistService(opts: Playlist) {
  return Promise.resolve();
}

export { playlistService };
