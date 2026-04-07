import mongoose from "mongoose";
import { Schema } from "mongoose";

export const user = new Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
    isAuthenticated: { type: Boolean, default: false },
    profileImg: String,
    bannerImg: String,
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
    subscribs: [{ type: Schema.Types.ObjectId, ref: "Subscribe" }],
    history: [{ type: Schema.Types.ObjectId, ref: "History" }],
    playlist: [{ type: Schema.Types.ObjectId, ref: "Playlist" }],
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", user);
