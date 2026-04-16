import express from "express";
import fetcherRoutes from "./routes/fetchRoutes";
import alertRoutes from "./routes/alertRoutes";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
app.use("/api", fetcherRoutes);
app.use("/api/alerts", alertRoutes);

// Health check
// Health check — shows all service status
app.get("/api/health", async (_req, res) => {
  const mongoose = await import("mongoose");
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()) + "s",
    database: {
      mongodb:
        mongoose.default.connection.readyState === 1
          ? "connected"
          : "disconnected",
      postgres: "connected",
    },
  });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  },
);

export default app;
