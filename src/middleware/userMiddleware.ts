import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../..", ".env") });
const JWT_SECRET = process.env.JWT_SECRET;

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(403).json({ message: "Unauthorized Access!" });
  }

  try {
    const decoded = jwt.verify(
      token as string,
      JWT_SECRET as string
    ) as JwtPayload;

    if (decoded && decoded.userId) {
      (req as any).userId = decoded.userId;
      next();
    } else {
      res.status(403).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    console.error("Error verifying token:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
