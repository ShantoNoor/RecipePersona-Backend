import express from "express";
import cors from "cors";
import { getRecommendations } from "./RecommendationEngine.js";

import { config } from "dotenv";
import Recipe from "./models/Recipe.model.js";
import User from "./models/User.model.js";
import mongoose from "mongoose";
config({
  path: ".env.local",
});

const app = express();

// eslint-disable-next-line no-undef
const port = process.env.port || 3000;

// eslint-disable-next-line no-undef
mongoose.connect(process.env.DB_URI);

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  return res.send("Recipe Persona server is Running");
});

app.get("/users", async (req, res) => {
  try {
    return res.send(await User.find(req.query));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    return res.status(201).send(result);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(201)
        .send(await User.findOne({ email: req.body.email }));
    }
    return res.status(err.code).send(err.message);
  }
});

app.put("/users/:_id", async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.params._id },
      {
        $set: req.body,
      }
    );
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.get("/recipes", async (req, res) => {
  try {
    return res.send(await Recipe.find(req.query).populate("author"));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.post("/recipes", async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const result = await recipe.save();
    return res.status(201).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.put("/recipes/:id", async (req, res) => {
  try {
    const result = await Recipe.updateOne(
      { _id: req.params.id },
      {
        $set: req.body,
      }
    );
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
})

app.delete("/recipes/:id", async (req, res) => {
  try {
    const result = await Recipe.deleteOne({ _id: req.params.id });
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
})

app.get("/recommendations/:_id", async (req, res) => {
  const { _id } = req.params;

  // get recipe recipeData with rating from db
  // this is only for demo
  const recipeData = [
    { userId: 1, recipeId: 101, rating: 3 },
    { userId: 1, recipeId: 103, rating: 1 },
    { userId: 1, recipeId: 105, rating: 1 },

    { userId: 2, recipeId: 101, rating: 1 },
    { userId: 2, recipeId: 103, rating: 4 },
    { userId: 2, recipeId: 104, rating: 1 },

    { userId: 3, recipeId: 101, rating: 3 },
    { userId: 3, recipeId: 102, rating: 1 },
    { userId: 3, recipeId: 104, rating: 3 },
    { userId: 3, recipeId: 105, rating: 1 },

    { userId: 4, recipeId: 102, rating: 3 },
    { userId: 4, recipeId: 104, rating: 4 },
    { userId: 4, recipeId: 105, rating: 4 },
  ];

  const result = await getRecommendations(recipeData, parseInt(_id));
  return res.send(result);
});

app.listen(port, () => {
  console.log(`Recipe Persona server is listening on port ${port}`);
});
