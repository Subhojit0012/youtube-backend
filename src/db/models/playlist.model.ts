import mongoose, { Model, Types } from "mongoose";
import { Schema } from "mongoose";

export const playlist = new Schema(
  {
    name: { type: String, required: true },
    contents: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    methods: {
      async addToPlaylist(
        userId: Types.ObjectId,
        videoId: Types.ObjectId,
      ) {
        if (!videoId && !userId)
          return new Error("VIDEO ID AND USER ID ARE REQUIRED");

        if (this.owner?.toString() !== userId?.toString()) {
          throw new Error("UNAUTHORIZED");
        }

        this.contents?.push(videoId);
        await this.save();
      },
    },
    statics: {
      async createPlaylist(name: string, user: Types.ObjectId) {
        if (this.name === name && this.owner.toString() === user.toString()) {
          throw new Error("PLAYLIST ALREADY EXISTS");
        }
        await this.create({
          name,
          owner: user,
        });
      },
    },
    timestamps: true,
  },
);

export const Playlist = mongoose.model(
  "Playlist",
  playlist,
);
