import express from "express";
import cors from "cors";
import { getRecommendations } from "./RecommendationEngine.js";

import { config } from "dotenv";
import Recipe from "./models/Recipe.model.js";
import User from "./models/User.model.js";
import mongoose from "mongoose";
import Rating from "./models/Rating.model.js";
import Favorite from "./models/Favorite.model.js";

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
  let query = req.query;
  let filter = {};
  if (query) {
    filter = { ...query };

    if (filter._id) {
      filter._id = new mongoose.Types.ObjectId(filter._id);
    }

    if (filter.author) {
      filter.author = new mongoose.Types.ObjectId(filter.author);
    }

    delete filter.page; // Assuming pagination
    delete filter.limit; // Assuming pagination
  }
  try {
    const recipesWithRatings = await Recipe.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "recipe",
          as: "ratings",
        },
      },
      {
        $addFields: {
          averageRating: {
            $ifNull: [{ $avg: "$ratings.rating" }, 0],
          },
        },
      },
    ]);

    const populatedRecipes = await Recipe.populate(recipesWithRatings, {
      path: "author",
      select: "name photo",
    });

    return res.send(populatedRecipes);
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
});

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
});

app.get("/recommendations/:_id", async (req, res) => {
  const { _id } = req.params;

  const userIds = (await User.find({})).map((user) => user._id.toString());
  const recipeIds = (await Recipe.find({})).map((recipe) =>
    recipe._id.toString()
  );
  const ratingData = (await Rating.find({})).map((rating) => {
    return {
      userId: rating.author._id.toString(),
      recipeId: rating.recipe.toString(),
      rating: rating.rating,
    };
  });

  const recipeData = createCompleteRatingData(userIds, recipeIds, ratingData);

  const recommendedRecipes = await getRecommendations(recipeData, _id);

  // console.log(recommendedRecipes);

  const predictedRecipeIds = recommendedRecipes.map(
    (predictions) => predictions.recipeId
  );

  const recipes = await Recipe.find({
    _id: { $in: predictedRecipeIds },
  }).populate("author", "name photo");

  // removing own recipe
  const filteredRecipes = recipes.filter(
    (recipe) => recipe.author._id.toString() !== _id
  );

  return res.send(filteredRecipes);
});

app.get("/ratings", async (req, res) => {
  try {
    return res.send(await Rating.find(req.query));
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.put("/ratings", async (req, res) => {
  try {
    const result = await Rating.updateOne(
      { recipe: req.body.recipe, author: req.body.author },
      {
        $set: req.body,
      },
      { upsert: true }
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

app.get("/favorites", async (req, res) => {
  try {
    const favoriteRecipesIds = (
      await Favorite.find(req.query).sort({ updatedAt: -1 })
    ).map((f) => f.recipe);

    const favoriteRecipes = await Recipe.find({
      _id: { $in: favoriteRecipesIds },
    }).populate("author", "name photo");
    return res.send(favoriteRecipes);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.put("/favorites", async (req, res) => {
  try {
    const result = await Favorite.updateOne(
      { recipe: req.body.recipe, author: req.body.author },
      {
        $set: req.body,
      },
      { upsert: true }
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

app.delete("/favorites/:pk", async (req, res) => {
  const [author, recipe] = req.params.pk.split("-");

  try {
    const result = await Favorite.deleteOne({
      author: new mongoose.Types.ObjectId(author),
      recipe: new mongoose.Types.ObjectId(recipe),
    });
    return res.status(200).send(result);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.message);
    } else {
      return res.status(500).send("Something went wrong");
    }
  }
});

app.get("/home", async (req, res) => {
  try {
    const result = await Recipe.aggregate([
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "recipe",
          as: "ratings",
        },
      },
      {
        $addFields: {
          averageRating: {
            $ifNull: [{ $avg: "$ratings.rating" }, 0],
          },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Recipe Persona server is listening on port ${port}`);
});

function createCompleteRatingData(userIds, recipeIds, ratingData) {
  const completeData = [];
  const ratingsByUserRecipe = {};

  // Store ratings by user-recipe combination for efficient lookup
  ratingData.forEach((data) => {
    ratingsByUserRecipe[`${data.userId}${data.recipeId}`] = data.rating;
  });

  for (const userId of userIds) {
    for (const recipeId of recipeIds) {
      const combinedId = `${userId}${recipeId}`;
      const rating = ratingsByUserRecipe[combinedId] || 0;
      completeData.push({ userId, recipeId, rating });
    }
  }

  return completeData;
}
