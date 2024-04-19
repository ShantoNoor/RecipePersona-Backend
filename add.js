import { config } from "dotenv";
import Recipe from "./models/Recipe.model.js";
import mongoose from "mongoose";
config({
  path: ".env.local",
});

import { readFile } from "fs/promises";

(async () => {
  const data = await readFile("./final.json")
    .then((json) => JSON.parse(json))
    .catch(() => null);

  try {
    // eslint-disable-next-line no-undef
    await mongoose.connect(process.env.DB_URI);

    for (let i = 2; i < data.length; i++) {
      const recipe = new Recipe(data[i]);
      const result = await recipe.save();
      console.log("Saved to db");
      console.log(result);
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      console.log(err.message);
    } else {
      console.log("Something went wrong");
    }
  } finally {
    mongoose.connection.close();
  }
})();
