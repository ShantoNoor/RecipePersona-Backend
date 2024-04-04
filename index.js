import express from "express";
import cors from "cors";
import { config } from "dotenv";
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

app.listen(port, () => {
  console.log(`Recipe Persona server is listening on port ${port}`);
});
