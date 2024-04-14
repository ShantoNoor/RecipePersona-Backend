import * as tf from "@tensorflow/tfjs";

const getUniqueIds = (recipeData) => {
  return {
    uniqueUserIds: Array.from(new Set(recipeData.map((entry) => entry.userId))),
    uniqueRecipeIds: Array.from(
      new Set(recipeData.map((entry) => entry.recipeId))
    ),
  };
};

export const getPredictions = async (
  recipeData,
  newRecipeData,
  epochs = 100,
  batchSize = 32
) => {
  // Extract unique userIds and recipeIds
  const { uniqueUserIds, uniqueRecipeIds } = getUniqueIds(recipeData);

  // One-hot encode userIds and recipeIds
  const oneHotEncode = (value, uniqueValues) => {
    const encoding = new Array(uniqueValues.length).fill(0);
    encoding[uniqueValues.indexOf(value)] = 1;
    return encoding;
  };

  const features = recipeData.map((entry) => [
    ...oneHotEncode(entry.userId, uniqueUserIds),
    ...oneHotEncode(entry.recipeId, uniqueRecipeIds),
  ]);

  // Normalize ratings to a range between 0 and 1
  const minRating = Math.min(...recipeData.map((entry) => entry.rating));
  const maxRating = Math.max(...recipeData.map((entry) => entry.rating));

  const normalizeRating = (rating) =>
    (rating - minRating) / (maxRating - minRating);

  const labels = recipeData.map((entry) => normalizeRating(entry.rating));

  // Convert features and labels to tensors
  const featuresTensor = tf.tensor2d(features);
  const labelsTensor = tf.tensor1d(labels);

  // Calculating the inputShape for dense layer
  const numUserIds = uniqueUserIds.length;
  const numrecipeIds = uniqueRecipeIds.length;
  // Concatenated length of one-hot encoded vectors
  const inputShape = numUserIds + numrecipeIds;

  // Creating Model
  const model = new tf.Sequential();
  model.add(
    tf.layers.dense({ inputShape: [inputShape], units: 64, activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));
  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  try {
    // Training the model
    await model.fit(featuresTensor, labelsTensor, { epochs, batchSize });
    // console.log("Training complete !... ");

    // Process the new recipeData similar to the training recipeData
    const newFeatures = newRecipeData.map((entry) => [
      ...oneHotEncode(entry.userId, uniqueUserIds),
      ...oneHotEncode(entry.recipeId, uniqueRecipeIds),
    ]);

    // Convert the features for prediction into a tensor
    const newFeaturesTensor = tf.tensor2d(newFeatures);

    // Use the trained model to make predictions
    const predictions = model.predict(newFeaturesTensor);

    // Convert the predictions tensor to a JavaScript array
    const predictionsArray = predictions.arraySync();

    // Return the predictions
    return predictionsArray.map((arr) => arr[0]);
  } catch (error) {
    console.error("Error during training:", error);
  }
};

export const getRecommendations = async (recipeData, userId, iter = 3) => {
  // Extract unique userIds and recipeIds
  const { uniqueRecipeIds } = getUniqueIds(recipeData);

  // Filter recipeData based on userId
  const filteredRecipeData = recipeData.filter(
    (data) => data.userId === userId
  );

  // Extract unique recipeIds for userId
  const { uniqueRecipeIds: filteredUniqueRecipeIds } =
    getUniqueIds(filteredRecipeData);

  // Getting the ids of the recipes which user not rated yet.
  // Ids of all the recipes which user may like or needs predictions.
  const recipePredictionsIds = uniqueRecipeIds.filter(
    (ele) => !filteredUniqueRecipeIds.includes(ele)
  );

  const newRecipeData = recipePredictionsIds.map((id) => {
    return { userId: userId, recipeId: id };
  });

  // Store all the prediction values in every iteration
  // then this array will be used to calculate average prediction
  // which will result in a very accurate prediction
  const predictionsArray = [];

  for (let i = 0; i < iter; ++i) {
    const predictions = await getPredictions(recipeData, newRecipeData);
    predictionsArray.push(predictions);
  }

  // Use reduce to sum up values in each column
  const columnSums = predictionsArray.reduce((acc, row) => {
    row.forEach((value, index) => {
      acc[index] = (acc[index] || 0) + value;
    });
    return acc;
  }, []);

  // Calculate column average
  const predictionsAverage = columnSums.map(
    (sum) => sum / predictionsArray.length
  );

  // Combining recipeIds with predictedScores
  const topPredictedRecipes = newRecipeData.map((data, idx) => {
    return {
      recipeId: data.recipeId,
      predictionScore: predictionsAverage[idx],
    };
  });
  topPredictedRecipes.sort((a, b) => b.predictionScore - a.predictionScore);

  return topPredictedRecipes;
};

