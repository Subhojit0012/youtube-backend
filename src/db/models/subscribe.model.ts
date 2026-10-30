import mongoose from "mongoose";
import { Schema } from "mongoose";

/**
 * @param subscriber User subscribing to
 * @param subscribedTo Whom the user subscribed to
 * @param count number of subcribers
 * 
 * one-to-one relation
*/

export const subscribe = new Schema(
  {
    subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscribedTo: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Subscribe = mongoose.model("Subscribe", subscribe);
