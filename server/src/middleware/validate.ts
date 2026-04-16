import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error?.issues?.map((e) => ({
          field: e.path.join(".") || "unknown",
          message: e.message,
        })) ?? [{ field: "unknown", message: "Validation failed" }];

        res.status(400).json({ error: "Validation failed", errors });
        return;
      }

      req.body = result.data;
      next();
    } catch (err) {
      console.error("Validation middleware error:", err);
      res.status(400).json({ error: "Invalid request body" });
    }
  };
}