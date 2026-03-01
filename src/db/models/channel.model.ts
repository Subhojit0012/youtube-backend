import mongoose from "mongoose";
import { Schema } from "mongoose";

export const channel = new Schema(
  {
    name: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    owner: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    playlists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
  },
  { timestamps: true },
);
export const Channel = mongoose.model("Channel", channel);
