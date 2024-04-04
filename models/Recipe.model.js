import mongoose from "mongoose";
const { Schema } = mongoose;

const recipeSchema = new Schema(
  {
    strMeal: {
      require: true,
      type: String,
    },
    strCategory: {
      default: "",
      type: String,
    },
    strMealThumb: {
      default: "",
      type: String,
    },
    strArea: {
      default: "",
      type: String,
    },
    strTags: {
      default: "",
      type: String,
    },
    strYoutube: {
      default: "",
      type: String,
    },
    strInstructions: {
      default: "",
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    strIngredient1: {
      default: "",
      type: String,
    },
    strIngredient2: {
      default: "",
      type: String,
    },
    strIngredient3: {
      default: "",
      type: String,
    },
    strIngredient4: {
      default: "",
      type: String,
    },
    strIngredient5: {
      default: "",
      type: String,
    },
    strIngredient6: {
      default: "",
      type: String,
    },
    strIngredient7: {
      default: "",
      type: String,
    },
    strIngredient8: {
      default: "",
      type: String,
    },
    strIngredient9: {
      default: "",
      type: String,
    },
    strIngredient10: {
      default: "",
      type: String,
    },
    strIngredient11: {
      default: "",
      type: String,
    },
    strIngredient12: {
      default: "",
      type: String,
    },
    strIngredient13: {
      default: "",
      type: String,
    },
    strIngredient14: {
      default: "",
      type: String,
    },
    strIngredient15: {
      default: "",
      type: String,
    },
    strIngredient16: {
      default: "",
      type: String,
    },
    strIngredient17: {
      default: "",
      type: String,
    },
    strIngredient18: {
      default: "",
      type: String,
    },
    strIngredient19: {
      default: "",
      type: String,
    },
    strIngredient20: {
      default: "",
      type: String,
    },
    
    strMeasure1: {
      default: "",
      type: String,
    },
    strMeasure2: {
      default: "",
      type: String,
    },
    strMeasure3: {
      default: "",
      type: String,
    },
    strMeasure4: {
      default: "",
      type: String,
    },
    strMeasure5: {
      default: "",
      type: String,
    },
    strMeasure6: {
      default: "",
      type: String,
    },
    strMeasure7: {
      default: "",
      type: String,
    },
    strMeasure8: {
      default: "",
      type: String,
    },
    strMeasure9: {
      default: "",
      type: String,
    },
    strMeasure10: {
      default: "",
      type: String,
    },
    strMeasure11: {
      default: "",
      type: String,
    },
    strMeasure12: {
      default: "",
      type: String,
    },
    strMeasure13: {
      default: "",
      type: String,
    },
    strMeasure14: {
      default: "",
      type: String,
    },
    strMeasure15: {
      default: "",
      type: String,
    },
    strMeasure16: {
      default: "",
      type: String,
    },
    strMeasure17: {
      default: "",
      type: String,
    },
    strMeasure18: {
      default: "",
      type: String,
    },
    strMeasure19: {
      default: "",
      type: String,
    },
    strMeasure20: {
      default: "",
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
