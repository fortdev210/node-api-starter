import { z, AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const UserSignUpValidator = z.object({
  email: z.string({ required_error: "Email is required" }).email().trim(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Must be 5 or fewer characters long" }),
});

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.issues);
        return res.status(400).json(error);
      } else {
        return res.status(400).json(error);
      }
    }
  };
