import rateLimit from "express-rate-limit";

export const priceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: "Too many requests, please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const alertLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many requests, please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});