import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  displayName: {
    require: true,
    type: String,
  },
  email: {
    require: true,
    type: String,
    unique: true,
  },
  photoURL: {
    require: false,
    type: String,
    default: "",
  },
  dietaryPreferences: {
    type: String,
    default: "",
  },
  allergies: {
    type: String,
    default: "",
  },
  favoriteCuisines: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
export default User;