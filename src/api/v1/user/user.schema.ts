import { z } from "zod";

export const VerifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email().trim(),
  }),
});

export const ConfirmVerificationCodeSchema = z.object({
  body: z.object({
    email: z.string().email().trim(),
    code: z.string(),
  }),
});
