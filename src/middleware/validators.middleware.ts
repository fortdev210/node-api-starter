import { z, AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const UserSignUpValidator = z.object({
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
      let err = error;

      if (err instanceof z.ZodError) {
        err = err.issues.map((e) => ({ path: e.path[0], message: e.message }));
      }
      return res.status(409).json({
        status: "failed",
        error: err,
      });
    }
  };
