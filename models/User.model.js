import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    require: true,
    type: String,
  },
  email: {
    require: true,
    type: String,
    unique: true,
  },
  photo: {
    require: false,
    type: String,
    default: "",
  },
  dietaryPreferences: {
    type: String,
    default: "nope",
  },
  allergies: {
    type: [{ type: String }],
    default: [],
  },
  favoriteCuisines: {
    type: [{ type: String }],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
