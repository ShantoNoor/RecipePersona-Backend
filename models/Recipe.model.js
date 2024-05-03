import mongoose from "mongoose";
const { Schema } = mongoose;

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: false,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: false,
        },
        measure: {
          type: String,
          required: false,
        },
      },
    ],
    allergicIngredients: {
      type: [{ type: String }],
      default: [],
      require: false,
    },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
