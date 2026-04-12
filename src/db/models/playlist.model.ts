import mongoose from "mongoose";
import { Schema } from "mongoose";

export const playlist = new Schema(
  {
    name: { type: String, required: true },
    contents: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    methods: {
      addToPlaylist(
        userId: mongoose.Types.ObjectId,
        videoId?: mongoose.Types.ObjectId,
      ) {
        if (!videoId && !userId)
          return new Error("VIDEO ID AND USER ID ARE REQUIRED");

        if (this.owner?.toString() !== userId?.toString()) {
          throw new Error("UNAUTHORIZED");
        }

        this.contents.push(videoId);
      },
      removeFromPlaylist(
        userId: mongoose.Types.ObjectId,
        videoId?: mongoose.Types.ObjectId,
      ) {
        if (!videoId && !userId)
          return new Error("VIDEO ID AND USER ID ARE REQUIRED");

        if (this.owner?.toString() !== userId?.toString()) {
          throw new Error("UNAUTHORIZED");
        }

        this.contents = this.contents.filter(
          (item: mongoose.Types.ObjectId) =>
            item.toString() !== videoId?.toString(),
        );
      },
    },
    timestamps: true,
  },
);

export const Playlist = mongoose.model("Playlist", playlist);
