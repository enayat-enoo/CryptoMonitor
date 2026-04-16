import { Pool } from "pg";

let pool: Pool | null = null;

export async function connectPostgres(): Promise<void> {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });

  // Test connection
  const client = await pool.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS price_history (
      id          SERIAL PRIMARY KEY,
      coin_id     VARCHAR(50)    NOT NULL,
      currency    VARCHAR(10)    NOT NULL DEFAULT 'usd',
      price       NUMERIC(20, 8) NOT NULL,
      recorded_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    );
  `);

  // Indexes for fast time-range queries
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_price_history_coin_currency
      ON price_history (coin_id, currency);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at
      ON price_history (recorded_at DESC);
  `);

  client.release();
  console.log("PostgreSQL connected, price_history table ready");
}

export function getPool(): Pool {
  if (!pool) throw new Error("PostgreSQL not initialized. Call connectPostgres first.");
  return pool;
}