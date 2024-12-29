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

app.use("/api/v1", userRouter);
app.use("/api/v1",contentRouter);
app.use("/api/v1",linkRouter);

run().catch((err) => console.log(err));

async function run() {
  await connect(
    process.env.MONGO_URL as string
  );

  console.log("Connected to MongoDB!");
  app.listen(PORT, () => {
    console.log("Server is running in port 3001");
  });
}
