import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PriceChart from "./PriceChart";
import type { PriceHistoryPoint } from "../types";
import { POPULAR_COINS, POPULAR_CURRENCIES, CURRENCY_SYMBOLS } from "../constants/coins";

const API = import.meta.env.VITE_API_URL;

export default function PriceViewer() {
  const [coin, setCoin]           = useState("bitcoin");
  const [currency, setCurrency]   = useState("usd");
  const [price, setPrice]         = useState<number | null>(null);
  const [history, setHistory]     = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const [priceRes, historyRes] = await Promise.all([
        axios.get(`${API}/api/price`, { params: { coin, currency } }),
        axios.get(`${API}/api/price/history`, {
          params: { coin, currency, hours: 24 },
        }),
      ]);

      setPrice(priceRes.data.price);
      setHistory(historyRes.data.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      const msg = err.response?.data?.error ?? "Failed to fetch price";
      toast.error(msg);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  }, [coin, currency]);

  const coinName  = POPULAR_COINS.find((c) => c.id === coin)?.name ?? coin;
  const symbol    = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();
  const formatted = price !== null
    ? `${symbol}${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-32">
          <label className="text-xs text-slate-400 mb-1 block">Coin</label>
          <select
            value={coin}
            onChange={(e) => { setCoin(e.target.value); setPrice(null); setHistory([]); }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
          >
            {POPULAR_COINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-28">
          <label className="text-xs text-slate-400 mb-1 block">Currency</label>
          <select
            value={currency}
            onChange={(e) => { setCurrency(e.target.value); setPrice(null); setHistory([]); }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchPrice}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
        >
          {loading ? "Fetching..." : "Fetch Price"}
        </button>
      </div>

      {/* Price display */}
      {formatted && (
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">{coinName} / {currency.toUpperCase()}</p>
            <p className="text-4xl font-bold text-slate-100 tracking-tight">
              {formatted}
            </p>
          </div>
          {lastUpdated && (
            <p className="text-xs text-slate-600 pb-1">
              Updated {lastUpdated}
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      <PriceChart data={history} currency={currency} />
    </div>
  );
}