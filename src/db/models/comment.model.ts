import mongoose, { Schema } from "mongoose";

export const comment = new Schema(
  {
    videoId: [{ type: Schema.Types.ObjectId, required: true, ref: "Video" }],
    userId: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", comment);
