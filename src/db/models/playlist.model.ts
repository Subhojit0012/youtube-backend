import mongoose, { Model } from "mongoose";
import { Schema } from "mongoose";

interface IPlaylist {
  name: string;
  contents: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
}

interface PlaylistModelType extends Model<IPlaylist> {
  createPlaylist(name: string, owner: mongoose.Types.ObjectId): Promise<void>;
}

interface PlaylistMethods {
  addToPlaylist(
    userId: mongoose.Types.ObjectId,
    videoId: mongoose.Types.ObjectId,
  ): Promise<void>;
  removeFromPlaylist(
    userId: mongoose.Types.ObjectId,
    videoId: mongoose.Types.ObjectId,
  ): void;
}



export const playlist = new Schema(
  {
    name: { type: String, required: true },
    contents: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    methods: {
      async addToPlaylist(
        userId: mongoose.Types.ObjectId,
        videoId: mongoose.Types.ObjectId,
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
        userId: mongoose.Types.ObjectId,
        videoId: mongoose.Types.ObjectId,
      ) {
        if (!videoId && !userId)
          return new Error("VIDEO ID AND USER ID ARE REQUIRED");

        if (this.owner?.toString() !== userId?.toString()) {
          throw new Error("UNAUTHORIZED");
        }

        this.contents = this.contents?.filter(
          (item: mongoose.Types.ObjectId) =>
            item.toString() !== videoId?.toString(),
        );
      },
    },
    statics: {
      async createPlaylist(name: string, owner: mongoose.Types.ObjectId) {
        if (this.name === name && this.owner.toString() === owner.toString()) {
          throw new Error("PLAYLIST ALREADY EXISTS");
        }
        await this.create({
          name,
          owner,
        });
      },
    },
    timestamps: true,
  },
);

type PlaylistModel = Model<
  IPlaylist,
  {},
  Pick<PlaylistMethods, "addToPlaylist">,
  Pick<PlaylistMethods, "removeFromPlaylist">
> &
  Pick<PlaylistModelType, "createPlaylist">;



export const Playlist = mongoose.model<IPlaylist, PlaylistModel>(
  "Playlist",
  playlist,
);
