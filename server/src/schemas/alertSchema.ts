import { z } from "zod";

export const createAlertSchema = z.object({
  coinID: z
    .string({ required_error: "coinID is required" })
    .min(1)
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
    .number({ required_error: "targetPrice is required" })
    .positive("targetPrice must be a positive number")
    .finite(),

  condition: z.enum(["above", "below"], {
    errorMap: () => ({ message: 'condition must be "above" or "below"' }),
  }),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;