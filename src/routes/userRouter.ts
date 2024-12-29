import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import { authSchema } from "../zod";
import bcrypt from "bcrypt";
import { UserModel } from "../db/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });
const JWT_SECRET = process.env.JWT_SECRET;

// Explicitly type the request and response
router.post("/signup", async (req: Request, res: Response) => {
  try {
    // Validate data using Zod
    const validatedData = authSchema.safeParse(req.body);
    
    // Check if validation was successful
    if (!validatedData.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input",
        errors: validatedData.error.errors
      });
    }

    const { username, password } = validatedData.data;

    // Check if user exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(403).json({
        status: "error",
        message: "User already exists with this username",
      });
    }

    // Secure password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    // Validate data using Zod
    const validatedData = authSchema.safeParse(req.body);
    
    // Check if validation was successful
    if (!validatedData.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input",
        errors: validatedData.error.errors
      });
    }

    const { username, password } = validatedData.data;

    // Find user
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(403).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({
        status: "error",
        message: "Invalid username or password",
      });
    }

    // Generate token
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
});

export default router;