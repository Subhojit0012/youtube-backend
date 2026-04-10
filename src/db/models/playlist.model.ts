import mongoose from "mongoose";
import { Schema } from "mongoose";

export const playlist = new Schema(
  {
    name: { type: String, required: true },
    contents: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// methods implementation
playlist.methods.addToPlaylist = function (
  videoId?: mongoose.Types.ObjectId,
  userId?: mongoose.Types.ObjectId,
) {
  if (!videoId && !userId)
    return new Error("VIDEO ID AND USER ID ARE REQUIRED");

  if (this.owner.toString() !== userId?.toString()) {
    throw new Error("UNAUTHORIZED");
  }

  this.contents.push(videoId);
};

playlist.methods.removeFromPlaylist = function (
  videoId?: mongoose.Types.ObjectId,
  userId?: mongoose.Types.ObjectId,
) {
  if (!videoId && !userId)
    return new Error("VIDEO ID AND USER ID ARE REQUIRED");

  if (this.owner.toString() !== userId?.toString()) {
    throw new Error("UNAUTHORIZED");
  }

  this.contents = this.contents.filter(
    (item: mongoose.Types.ObjectId) => item.toString() !== videoId?.toString(),
  );
};

export const Playlist = mongoose.model("Playlist", playlist);
