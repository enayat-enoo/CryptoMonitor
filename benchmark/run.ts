import axios from "axios";
import { createClient } from "redis";

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const REDIS_URL = process.env.REDIS_API || "redis://localhost:6379";
const COIN = "bitcoin";
const CURRENCY = "usd";
const REQUESTS = 50;

interface BenchmarkResult {
  label: string;
  avg: number;
  min: number;
  max: number;
  p95: number;
  count: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.max(0, idx) < sorted.length ? sorted[idx] : sorted[sorted.length - 1];
}

function analyze(label: string, times: number[]): BenchmarkResult {
  const sorted = [...times].sort((a, b) => a - b);
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  return {
    label,
    count: times.length,
    avg: parseFloat(avg.toFixed(2)),
    min: parseFloat(sorted[0].toFixed(2)),
    max: parseFloat(sorted[sorted.length - 1].toFixed(2)),
    p95: parseFloat(percentile(sorted, 95).toFixed(2)),
  };
}

function printResult(r: BenchmarkResult) {
  console.log(`\n── ${r.label} ──`);
  console.log(`  Requests : ${r.count}`);
  console.log(`  Avg      : ${r.avg} ms`);
  console.log(`  Min      : ${r.min} ms`);
  console.log(`  Max      : ${r.max} ms`);
  console.log(`  P95      : ${r.p95} ms`);
}

async function measureRequest(bustCache: boolean, redis: any): Promise<number> {
  // Delete the cache key before each request to force a real API call
  if (bustCache) {
    await redis.del(`price:${COIN}:${CURRENCY}`);
  }

  const start = performance.now();
  await axios.get(`${BASE_URL}/api/price/benchmark`, {
    params: { coin: COIN, currency: CURRENCY },
  });
  return performance.now() - start;
}

async function run() {
  console.log(`\nCrypto Monitor — Redis Cache Benchmark`);
  console.log(`Target  : ${BASE_URL}/api/price?coin=${COIN}&currency=${CURRENCY}`);
  console.log(`Rounds  : ${REQUESTS} requests per phase\n`);

  // Connect to Redis directly so we can bust the cache between requests
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  console.log("Connected to Redis for cache control\n");

  // ── Phase 1: Uncached ──────────────────────────────────────────
  console.log("Phase 1: Uncached — deleting Redis key before every request");
  console.log("Every request hits CoinGecko directly (true cold latency)...\n");

  const uncachedTimes: number[] = [];

  for (let i = 0; i < REQUESTS; i++) {
    // Small delay between uncached requests to avoid CoinGecko rate limiting
    if (i > 0) await new Promise((r) => setTimeout(r, 800));

    try {
      const time = await measureRequest(true, redis);
      uncachedTimes.push(time);
    } catch (err: any) {
      console.warn(`  Request ${i + 1} failed: ${err.message} — skipping`);
    }

    process.stdout.write(`\r  Progress: ${i + 1}/${REQUESTS}`);
  }
  console.log();

  const uncached = analyze("Uncached (cache miss — hits CoinGecko API)", uncachedTimes);
  printResult(uncached);

  // ── Phase 2: Cached ────────────────────────────────────────────
  console.log("\nPhase 2: Cached — all requests served from Redis\n");
  console.log("Pre-warming cache...");
  await measureRequest(false, redis); // warm up without busting

  const cachedTimes: number[] = [];

  for (let i = 0; i < REQUESTS; i++) {
    // No delay needed — Redis is fast
    try {
      const time = await measureRequest(false, redis);
      cachedTimes.push(time);
    } catch (err: any) {
      console.warn(`  Request ${i + 1} failed: ${err.message} — skipping`);
    }

    process.stdout.write(`\r  Progress: ${i + 1}/${REQUESTS}`);
  }
  console.log();

  const cached = analyze("Cached (cache hit — served from Redis)", cachedTimes);
  printResult(cached);

  await redis.disconnect();

  // ── Summary ────────────────────────────────────────────────────
  const avgReduction = (((uncached.avg - cached.avg) / uncached.avg) * 100).toFixed(1);
  const p95Reduction = (((uncached.p95 - cached.p95) / uncached.p95) * 100).toFixed(1);
  const savedMs = (uncached.avg - cached.avg).toFixed(1);

  console.log("\n══ Summary ══════════════════════════════════════════");
  console.log(`  Avg latency : ${uncached.avg}ms  →  ${cached.avg}ms   (${avgReduction}% reduction)`);
  console.log(`  P95 latency : ${uncached.p95}ms  →  ${cached.p95}ms   (${p95Reduction}% reduction)`);
  console.log(`  Saved       : ~${savedMs}ms per request on cache hit`);
  console.log("\n  ── Copy into your README ──────────────────────────");
  console.log(`  Redis caching reduced average response latency by ${avgReduction}%`);
  console.log(`  Uncached: ${uncached.avg}ms avg / ${uncached.p95}ms p95`);
  console.log(`  Cached:   ${cached.avg}ms avg  / ${cached.p95}ms p95`);
  console.log("══════════════════════════════════════════════════════\n");
}

run().catch((err) => {
  console.error("\nBenchmark failed:", err.message);
  process.exit(1);
});