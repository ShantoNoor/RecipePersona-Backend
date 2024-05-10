import mongoose from "mongoose";
const { Schema } = mongoose;

const favoriteSchema = new Schema(
  {
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

favoriteSchema.index({ author: 1, recipe: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);
export default Favorite;
