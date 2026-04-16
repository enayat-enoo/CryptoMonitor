import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

async function getCrypto(coinID: string, currency: string): Promise<number> {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: coinID,
        vs_currencies: currency,
      },
      headers: COINGECKO_API_KEY
        ? { "x-cg-demo-api-key": COINGECKO_API_KEY }
        : {},
    }
  );

  const price = response.data[coinID]?.[currency];
  if (price === undefined) {
    throw new Error(`Invalid coin "${coinID}" or currency "${currency}"`);
  }

  return price;
}

export default getCrypto;