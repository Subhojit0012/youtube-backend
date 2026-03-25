import mongoose from "mongoose";
import { Schema } from "mongoose";

export const playlist = new Schema(
  {
    name: { type: String, required: true },
    contents: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: {type: Schema.Types.ObjectId, ref: "User"}
  },
  { timestamps: true },
);

export const Playlist = mongoose.model("Playlist", playlist);
