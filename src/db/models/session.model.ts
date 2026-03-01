import { Schema } from "mongoose";
import mongoose from "mongoose";

export const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, default: Date.now, expires: "7d" },
    updatedAt: { type: Date, default: Date.now },
  },

  {
    methods: {
      touch: function () {
        this.updatedAt = new Date();
      },
    },
  },
);

export const Session = mongoose.model("Session", sessionSchema);



