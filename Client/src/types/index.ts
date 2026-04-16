export interface PriceHistoryPoint {
  price: number;
  recorded_at: string;
}

export interface AlertData {
  _id: string;
  coinID: string;
  currency: string;
  targetPrice: number;
  condition: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

export interface LiveAlert {
  coin: string;
  currency: string;
  condition: "above" | "below";
  target: number;
  currentPrice: number;
}