import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import PriceViewer from "./components/PriceViewer";
import AlertPanel from "./components/AlertPanel";
import LiveAlertFeed from "./components/LiveAlertFeed";
import type { AlertData, LiveAlert } from "./types";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [alerts, setAlerts]         = useState<AlertData[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/alerts`);
      setAlerts(res.data);
    } catch {
      // silently fail — not critical
    }
  }, []);

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Socket for real-time alert notifications
  useEffect(() => {
    const socket = io(API);

    socket.on("alert", (data: LiveAlert) => {
      setLiveAlerts((prev) => [...prev, data]);
      fetchAlerts(); // refresh the alert list to show triggered state
      toast.success(
        `${data.coin.toUpperCase()} hit target — now at ${data.currentPrice.toLocaleString()}`,
        { autoClose: 6000 }
      );
    });

    return () => { socket.disconnect(); };
  }, [fetchAlerts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100">
                CryptoMonitor
              </h1>
              <p className="text-xs text-slate-500">Real-time price tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Price viewer (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Live Price
            </h2>
            <PriceViewer />
          </div>

          {/* Benchmark callout */}
          <div className="bg-slate-900 border border-indigo-900 rounded-2xl p-5">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2">
              Performance
            </p>
            <p className="text-sm text-slate-300">
              Redis caching reduces average response latency by{" "}
              <span className="text-indigo-400 font-semibold">96.9%</span>
              {" "}— from{" "}
              <span className="text-slate-200">317ms</span> uncached
              {" "}to{" "}
              <span className="text-slate-200">9.7ms</span> cached
              {" "}(p95: 749ms → 21ms).
              Measured across 50 requests against live CoinGecko API.
            </p>
          </div>
        </div>

        {/* Right — Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Price Alerts
            </h2>
            <AlertPanel alerts={alerts} onAlertsChange={fetchAlerts} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Alert Feed
            </h2>
            <LiveAlertFeed alerts={liveAlerts} />
          </div>
        </div>

      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        theme="dark"
        toastStyle={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          color: "#e2e8f0",
        }}
      />
    </div>
  );
}