import { z } from "zod";

export const UserSignUpSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid.",
      })
      .email()
      .trim(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Must be 8 or longer characters long" }),
  }),
});

export const UserLogInSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid.",
      })
      .email()
      .trim(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Must be 8 or longer characters long" }),
  }),
});

export const PasswordResetRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid.",
      })
      .email()
      .trim(),
  }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    password: z.string({ required_error: "Password is required" }),
    token: z.string({ required_error: "Token is required" }),
  }),
});
