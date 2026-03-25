import mongoose, { Schema } from "mongoose";

export const videoSchema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String},
    videoFile: {type: String, required: true},
    thumbnail: {type: String, required: true},
    meta: {
      likes: { type: Number, default: 0 },
      comments: {
        count: { type: Number, default: 0 },
        enabled: { type: Boolean, default: true },
        userComments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      },

      views: {
        count: { type: Number, default: 0 },
        viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    },
    owner: {type: Schema.Types.ObjectId, ref: "User"}
  },
  { timestamps: true },
);

export const Video = mongoose.model("Video", videoSchema);
