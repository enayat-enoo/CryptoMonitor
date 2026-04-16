import { Request, Response } from "express";
import { getCryptoPrice } from "../services/fetcherService";
import { getPriceHistory } from "../services/priceHistoryService";

// GET /api/price?coin=bitcoin&currency=usd
export const fetchPrice = async (req: Request, res: Response) => {
  const coin = (req.query.coin as string)?.toLowerCase().trim();
  const currency = ((req.query.currency as string) || "usd").toLowerCase().trim();

  if (!coin) {
    res.status(400).json({ error: "coin query param is required" });
    return;
  }

  try {
    const price = await getCryptoPrice(coin, currency);
    res.json({ coin, currency, price });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/price/history?coin=bitcoin&currency=usd&hours=24
export const fetchPriceHistory = async (req: Request, res: Response) => {
  const coin = (req.query.coin as string)?.toLowerCase().trim();
  const currency = ((req.query.currency as string) || "usd").toLowerCase().trim();
  const hours = Math.min(parseInt(req.query.hours as string) || 24, 168); // max 7 days

  if (!coin) {
    res.status(400).json({ error: "coin query param is required" });
    return;
  }

  try {
    const history = await getPriceHistory(coin, currency, hours);
    res.json({ coin, currency, hours, count: history.length, data: history });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch price history" });
  }
};