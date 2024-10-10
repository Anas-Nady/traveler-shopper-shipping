import { models, model, Schema } from "mongoose";
import { IReview } from "../types/types";

const reviewSchema: Schema<IReview> = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: {
      type: String,
      required: true,
      maxLength: [300, "Comment too long"],
    },
  },
  { timestamps: true }
);

const Review = models.Review || model<IReview>("Review", reviewSchema);

export default Review;
