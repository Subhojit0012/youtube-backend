import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    videoId: { type: Schema.Types.ObjectId, required: true, ref: "Video" },
  },
  { timestamps: true },
);

export const Like = mongoose.model("Like", likeSchema);
