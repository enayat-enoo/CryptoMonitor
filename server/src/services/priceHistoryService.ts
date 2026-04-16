import { getPool } from "../config/postgres";

export async function savePriceSnapshot(
  coinID: string,
  currency: string,
  price: number
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO price_history (coin_id, currency, price, recorded_at)
     VALUES ($1, $2, $3, NOW())`,
    [coinID.toLowerCase(), currency.toLowerCase(), price]
  );
}

export async function getPriceHistory(
  coinID: string,
  currency: string,
  hours: number = 24
): Promise<{ price: number; recorded_at: string }[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT price, recorded_at
     FROM price_history
     WHERE coin_id  = $1
       AND currency = $2
       AND recorded_at >= NOW() - ($3 || ' hours')::INTERVAL
     ORDER BY recorded_at ASC`,
    [coinID.toLowerCase(), currency.toLowerCase(), hours]
  );

  return result.rows;
}

export async function getLatestPrice(
  coinID: string,
  currency: string
): Promise<number | null> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT price FROM price_history
     WHERE coin_id = $1 AND currency = $2
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [coinID.toLowerCase(), currency.toLowerCase()]
  );

  return result.rows.length > 0 ? parseFloat(result.rows[0].price) : null;
}