import { Router } from "express";
import { fetchPrice, fetchPriceHistory } from "../controllers/fetchController";
import { priceLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/price", priceLimiter, fetchPrice);
router.get("/price/history", priceLimiter, fetchPriceHistory);

// Internal benchmark route — no rate limit, only available in development
if (process.env.NODE_ENV !== "production") {
  router.get("/price/benchmark", fetchPrice);
}

export default router;
