import { z } from "zod";

export const createAlertSchema = z.object({
  coinID: z
    .string()
    .min(1, { message: "coinID is required" })
    .max(50)
    .toLowerCase()
    .trim(),

  currency: z
    .string()
    .min(1)
    .max(10)
    .toLowerCase()
    .trim()
    .default("usd"),

  targetPrice: z
    .number()
    .positive("targetPrice must be a positive number")
    .finite()
    .refine((val) => val !== undefined, { message: "targetPrice is required" }),

  condition: z.enum(["above", "below"], {
    message: 'condition must be "above" or "below"',
  }),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;