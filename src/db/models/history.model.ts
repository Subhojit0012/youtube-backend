import mongoose, { Schema } from "mongoose";

export const historySchema = new Schema(
  {
    videoId: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true },
);

export const History = mongoose.model("History", historySchema);
