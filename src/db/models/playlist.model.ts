import mongoose, { Model, Types } from "mongoose";
import { Schema } from "mongoose";

// export interface IPlaylist {
//   name: string;
//   contents: Types.ObjectId[];
//   owner: Types.ObjectId;
// }

// export interface PlaylistModelType extends Model<IPlaylist> {
//   createPlaylist(name: string, owner: Types.ObjectId): Promise<void>;
// }

// export interface PlaylistMethods {
//   addToPlaylist(
//     userId: Types.ObjectId,
//     videoId: Types.ObjectId,
//   ): Promise<void>;
//   removeFromPlaylist(
//     userId: Types.ObjectId,
//     videoId: Types.ObjectId,
//   ): void;
// }

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
      removeFromPlaylist(
        userId: Types.ObjectId,
        videoId: Types.ObjectId,
      ) {
        if (!videoId && !userId)
          return new Error("VIDEO ID AND USER ID ARE REQUIRED");

        if (this.owner?.toString() !== userId?.toString()) {
          throw new Error("UNAUTHORIZED");
        }

        this.contents = this.contents?.filter(
          (item: Types.ObjectId) =>
            item.toString() !== videoId?.toString(),
        );
      },
    },
    statics: {
      async createPlaylist(name: string, user: Types.ObjectId) {
        const existingPlaylist = await this.findOne({ name, owner: user });
        if (existingPlaylist) {
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

// type PlaylistModel = Model<
//   IPlaylist,
//   {},
//   Pick<PlaylistMethods, "addToPlaylist">,
//   Pick<PlaylistMethods, "removeFromPlaylist">
// > &
//   Pick<PlaylistModelType, "createPlaylist">;

export const Playlist = mongoose.model(
  "Playlist",
  playlist,
);
