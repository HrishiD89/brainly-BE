import express, { Request, Response, RequestHandler } from "express";
import { authSchema } from "../zod";
import bcrypt from "bcrypt";
import { UserModel } from "../db/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

// Define interfaces for type safety
interface AuthData {
  username: string;
  password: string;
}

type ExpressHandler = (
  req: Request,
  res: Response
) => Promise<void>;

dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

const signupHandler: RequestHandler = async (req, res, next) => {
  try {
    const validatedData = authSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      res.status(400).json({
        status: "error",
        message: "Invalid input",
        errors: validatedData.error.errors
      });
      return;
    }

    const { username, password } = validatedData.data;

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(403).json({
        status: "error",
        message: "User already exists with this username",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      message: "Signed up successfully",
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({
      status: "error",
      message: "Server error during signup",
    });
  }
};

const signinHandler: RequestHandler = async (req, res, next) => {
  try {
    const validatedData = authSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      res.status(400).json({
        status: "error",
        message: "Invalid input",
        errors: validatedData.error.errors
      });
      return;
    }

    const { username, password } = validatedData.data;

    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(403).json({
        status: "error",
        message: "Invalid username or password",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(403).json({
        status: "error",
        message: "Invalid username or password",
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: "success",
      message: "Signed in successfully",
      token: token,
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).json({
      status: "error",
      message: "Server error during signin",
    });
  }
};

// Register routes with the handlers
router.post("/auth/signup", signupHandler);
router.post("/auth/signin", signinHandler);

export default router;