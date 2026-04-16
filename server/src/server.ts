import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import http from "http";
import { initSocket } from "./config/socket";
import { evaluateAlerts } from "./services/alertService";
import { connectRedis } from "./config/redis";
import connectToDb from "./config/db";
import { connectPostgres } from "./config/postgres";
import { startPolling } from "./services/fetcherService";

// Validate required env vars at startup
const requiredEnvVars = ["MONGODB_URL", "REDIS_API", "POSTGRES_URL"];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`FATAL: Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await connectRedis(process.env.REDIS_API!);
    console.log("Redis connected");

    await connectToDb(process.env.MONGODB_URL!);
    console.log("MongoDB connected");

    await connectPostgres();
    console.log("PostgreSQL connected");

    const server = http.createServer(app);
    initSocket(server);

    startPolling();
    setInterval(evaluateAlerts, 15_000);

    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
}

startServer();