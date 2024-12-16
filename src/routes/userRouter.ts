import express from "express";
const router = express.Router({ mergeParams: true });
import { authSchema } from "../zod";
import bcrypt from "bcrypt";
import { UserModel } from "../db/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    //validate data
    const validatedData: z.infer<typeof authSchema> = authSchema.parse(
      req.body
    );
    const { username, password } = validatedData;

    // check user
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(403).json({
        message: "User already exist with this username",
      });
    }
    // secure password
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username: username,
      password: hashedPassword,
    });
    res.status(200).json({
      status: "success",
      message: "Signed up",
    });
  } catch (err: any) {
    //zod error becuse zod error has a errors property
    if (err.errors) {
      res.status(411).json({
        status: "error",
        message: "Error in inputs",
        errors: err.errors,
      });
    }

    // server error
    console.error("Error during registration:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

router.post("/signin", async (req, res) => {
  // validate data
  // check user exist or not
  // compare password
  // signin and generate token
  try {
    let validateData: z.infer<typeof authSchema> = authSchema.parse(req.body);
    const { username, password } = validateData;

    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(403).json({
        status: "error",
        message: "Wrong Username and Password",
      });
    } else {
      const isPassword = await bcrypt.compare(password, user.password);
      if (!isPassword) {
        res.status(403).json({
          status: "error",
          message: "Wrong Username and Password",
        });
      }

      const token = jwt.sign(
        {
          userId: user?._id,
        },
        JWT_SECRET as string
      );

      res.status(200).json({
        status: "success",
        message: "Signed in",
        token: token,
      });
    }
  } catch (err: any) {
    if (err.errors) {
      res.status(411).json({
        status: "error",
        message: "Error in inputs",
        errors: err.errors,
      });
    }

    // server error
    console.error("Error during registration:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
