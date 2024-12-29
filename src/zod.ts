import { z } from "zod";

export const authSchema = z.object({
    username: z
      .string()
      .regex(/^[a-zA-Z]{3,10}$/, "Username must be 3-10 letters and contain only alphabets"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(20, "Password must not exceed 20 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
  });

  // Automatically infer the types from the schema
export type AuthData = z.infer<typeof authSchema>;
