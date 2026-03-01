import mongoose from "mongoose";
import { Schema } from "mongoose";

export const subscribe = new Schema(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscribedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Subscribe = mongoose.model("Subscribe", subscribe);
