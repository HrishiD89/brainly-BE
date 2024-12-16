import express from "express";
import cors from "cors";
import { connect } from "mongoose";

import userRouter from "./routes/userRouter";
import contentRouter from "./routes/contentRouter";
import linkRouter from "./routes/linkRouter";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", userRouter);
app.use("/api/v1",contentRouter);
app.use("/api/v1",linkRouter);

run().catch((err) => console.log(err));

async function run() {
  await connect(
    "mongodb+srv://hrishi:hrishi5892@cluster0.wwng9.mongodb.net/brainly_app"
  );
  console.log("Connected to MongoDB!");
  app.listen(PORT, () => {
    console.log("Server is running in port 3001");
  });
}
