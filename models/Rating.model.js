import mongoose from "mongoose";
const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ author: 1, recipe: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
