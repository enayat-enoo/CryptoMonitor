import getCrypto from "../config/coingecko";
import { getRedisClient } from "../config/redis";
import { savePriceSnapshot } from "./priceHistoryService";

// Add coin to the active polling set
export const addActiveCoin = async (coinID: string): Promise<void> => {
  const redis = getRedisClient();
  await redis.sAdd("activeCoins", coinID.toLowerCase());
};

// Fetch price — Redis cache first, CoinGecko on miss
export const getCryptoPrice = async (
  coinID: string,
  currency: string
): Promise<number> => {
  const redis = getRedisClient();
  const cacheKey = `price:${coinID}:${currency}`;

  await addActiveCoin(coinID);

  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${coinID}/${currency}`);
    return parseFloat(cached);
  }

  console.log(`[Cache MISS] Fetching ${coinID}/${currency} from CoinGecko`);
  const price = await getCrypto(coinID, currency);

  await redis.set(cacheKey, price.toString(), { EX: 30 });

  // Save to PostgreSQL price history on every fresh fetch
  await savePriceSnapshot(coinID, currency, price);

  return price;
};

// Background polling — updates Redis cache + saves to PostgreSQL
export async function pollPrices(): Promise<void> {
  const redis = getRedisClient();
  const coins = await redis.sMembers("activeCoins");
  const currency = "usd";

  for (const coin of coins) {
    try {
      const price = await getCrypto(coin, currency);

      // Update Redis cache
      await redis.set(`price:${coin}:${currency}`, price.toString(), {
        EX: 30,
      });

      // Persist to PostgreSQL
      await savePriceSnapshot(coin, currency, price);

      console.log(`[Poll] ${coin} = ${price} ${currency.toUpperCase()}`);
    } catch (err) {
      console.error(`[Poll Error] ${coin}:`, err);
    }
  }
}

export function startPolling(): void {
  setInterval(pollPrices, 30_000);
}