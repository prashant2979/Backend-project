import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId, // reference to User or Channel
      ref: "User",
      required: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // optional: adds createdAt & updatedAt
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
