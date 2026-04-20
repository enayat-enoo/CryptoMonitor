# CryptoMonitor

A real-time cryptocurrency price monitoring and alerting system with a dark dashboard UI, price history charts, and benchmarked Redis caching performance.

🔴 **[Live Demo](https://crypto-monitor-dun.vercel.app/)** &nbsp;|&nbsp; ⌥ **[GitHub](https://github.com/enayat-enoo/crypto-price-monitor)**

![CryptoMonitor Dashboard](preview.png)

---

## What it does

- **Live price fetching** — fetch real-time prices for 8 major cryptocurrencies across 5 currencies via the CoinGecko API
- **Price history chart** — 24-hour price history stored in PostgreSQL and rendered as an area chart, updated on every fetch and background poll
- **Price alerts** — set above/below threshold alerts that fire in real time via Socket.IO when the price crosses your target
- **Redis caching** — every price is cached for 30 seconds, reducing external API calls and cutting response latency by 96.9%
- **Background polling** — active coins are polled every 30 seconds, keeping the cache warm and history up to date even when no one is fetching

---

## Performance — benchmarked numbers

Redis caching was benchmarked across 50 requests against the live CoinGecko API, with the cache key deleted before each uncached request to guarantee true cold hits.

| Metric | Uncached (CoinGecko) | Cached (Redis) | Reduction |
|--------|---------------------|----------------|-----------|
| Avg latency | 317.59ms | 9.70ms | **96.9%** |
| Min latency | 109.48ms | 5.94ms | 94.6% |
| P95 latency | 749.37ms | 21.90ms | **97.1%** |
| Max latency | 4371.28ms | 40.42ms | 99.1% |

Run the benchmark yourself:
```bash
npm run benchmark
```

---

## Architecture

Two databases are used intentionally for different reasons:

```
┌─────────────────────────────────────────────────────┐
│                    CryptoMonitor                    │
│                                                     │
│  React + Recharts ──── Socket.IO ──── Express API  │
│                                           │         │
│                          ┌────────────────┤         │
│                          ▼                ▼         │
│                       MongoDB        PostgreSQL     │
│                      (Alerts)      (Price history)  │
│                          │                          │
│                          └──── Redis (Cache) ───────┤
│                                    30s TTL          │
└─────────────────────────────────────────────────────┘
```

**MongoDB** stores price alerts — schema is flexible, alert conditions are document-shaped, and read patterns are simple (find all untriggered alerts). Mongoose makes the alert evaluation loop clean.

**PostgreSQL** stores price history — time-series data with numeric range queries benefits from B-tree indexes on `(coin_id, currency)` and `recorded_at DESC`. The compound index means history queries scan only the relevant coin's rows, not the full table.

**Redis** sits in front of CoinGecko — 30-second TTL keeps prices fresh while reducing external API calls. The `activeCoins` Redis Set tracks which coins to poll in the background so we only hit the API for coins users have actually requested.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Recharts, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Primary DB | MongoDB + Mongoose (alerts) |
| Time-series DB | PostgreSQL + pg (price history) |
| Cache | Redis (price cache, active coin tracking) |
| Real-time | Socket.IO |
| Validation | Zod |
| External API | CoinGecko |

---

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB running locally or Atlas connection string
- PostgreSQL running locally or a cloud connection string
- Redis running locally or Redis Cloud

### 1. Clone the repo

```bash
git clone https://github.com/enayat-enoo/crypto-price-monitor.git
cd crypto-price-monitor
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the root:

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017/cryptomonitordb
POSTGRES_URL=postgresql://postgres:yourpassword@localhost:5432/cryptomonitordb
REDIS_API=redis://localhost:6379
CLIENT_URL=http://localhost:5173
COINGECKO_API_KEY=your_coingecko_api_key_here
NODE_ENV=development
```

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE cryptomonitordb;"
```

The `price_history` table and indexes are created automatically on first server start.

Start the backend:

```bash
npm run dev
```

You should see:
```
Redis connected
MongoDB connected
PostgreSQL connected, price_history table ready
Server running on port 8000
```

### 3. Set up the frontend

```bash
cd client
npm install
```

Create a `.env` file inside `frontend-Crypto-Monitor/`:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/price?coin=bitcoin&currency=usd` | Fetch current price (Redis cache first) |
| GET | `/api/price/history?coin=bitcoin&currency=usd&hours=24` | Price history from PostgreSQL (max 168h) |
| GET | `/api/alerts` | List all alerts |
| POST | `/api/alerts` | Create a new alert |
| DELETE | `/api/alerts/:id` | Delete an alert |
| PATCH | `/api/alerts/:id/reset` | Reset a triggered alert |
| GET | `/api/health` | Service health check |

### Create alert — request body

```json
{
  "coinID": "bitcoin",
  "currency": "usd",
  "targetPrice": 50000,
  "condition": "above"
}
```

Validated with Zod — `condition` must be `"above"` or `"below"`, `targetPrice` must be a positive number.

---

## Project structure

```
crypto-price-monitor/
├── src/
│   ├── config/
│   │   ├── coingecko.ts            # Pure CoinGecko API client
│   │   ├── db.ts                   # MongoDB connection
│   │   ├── postgres.ts             # PostgreSQL connection + table setup
│   │   ├── redis.ts                # Redis connection
│   │   └── socket.ts              # Socket.IO setup
│   ├── controllers/
│   │   ├── alertController.ts      # CRUD for alerts
│   │   └── fetchController.ts      # Price + history endpoints
│   ├── middleware/
│   │   ├── rateLimiter.ts          # express-rate-limit config
│   │   └── validate.ts             # Zod validation middleware
│   ├── models/
│   │   └── alertModel.ts           # Mongoose Alert schema + indexes
│   ├── routes/
│   │   ├── alertRoutes.ts
│   │   └── fetchRoutes.ts
│   ├── schemas/
│   │   └── alertSchema.ts          # Zod schema for alert creation
│   ├── services/
│   │   ├── alertService.ts         # Alert evaluation loop
│   │   ├── fetcherService.ts       # Cache-aside + polling
│   │   └── priceHistoryService.ts  # PostgreSQL read/write
│   ├── app.ts
│   └── server.ts
│
├── benchmark/
│   └── run.ts                      # Cache vs uncached latency benchmark
│
└── frontend-Crypto-Monitor/
    └── src/
        ├── components/
        │   ├── AlertPanel.tsx
        │   ├── LiveAlertFeed.tsx
        │   ├── PriceChart.tsx
        │   └── PriceViewer.tsx
        ├── constants/
        │   └── coins.ts
        ├── types/
        │   └── index.ts
        └── App.tsx
```

---

## Key technical decisions

**Why delete-on-read for cache busting in the benchmark?**
The benchmark calls `redis.del()` before each uncached request to guarantee a true cold hit against CoinGecko. This gives an honest measurement of the cache miss path, not a measurement of how fast Redis responds to repeated warm reads.

**Why poll only active coins?**
The `activeCoins` Redis Set is populated the first time a user requests a coin. The background poller only iterates over that set — so if no one has ever asked for Cardano, it never gets polled. This keeps external API usage proportional to actual user interest.

**Why PostgreSQL for history and not MongoDB?**
Price history is append-only time-series data with one dominant query pattern: `WHERE coin_id = $1 AND recorded_at >= NOW() - interval`. PostgreSQL's B-tree index on `(coin_id, currency, recorded_at DESC)` makes this query a fast index scan. MongoDB would work too, but PostgreSQL indexes on numeric ranges are more efficient for this exact pattern — and it gives the architecture two genuinely different database tools rather than using MongoDB for everything.

---

## Author

**Md Enayat Ansari** — M.Tech Computer Science, RGPV University

[GitHub](https://github.com/enayat-enoo) · [LinkedIn](https://www.linkedin.com/in/md-enayat-ansari-856667228) · [enayatansari33@gmail.com](mailto:enayatansari33@gmail.com)