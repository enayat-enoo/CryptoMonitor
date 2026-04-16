import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { AlertData } from "../types";
import { POPULAR_COINS, POPULAR_CURRENCIES, CURRENCY_SYMBOLS } from "../constants/coins";

const API = import.meta.env.VITE_API_URL;

interface Props {
  alerts: AlertData[];
  onAlertsChange: () => void;
}

export default function AlertPanel({ alerts, onAlertsChange }: Props) {
  const [coinID, setCoinID]           = useState("bitcoin");
  const [currency, setCurrency]       = useState("usd");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition]     = useState<"above" | "below">("above");
  const [submitting, setSubmitting]   = useState(false);

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!targetPrice || isNaN(Number(targetPrice))) {
      toast.error("Enter a valid target price");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/alerts`, {
        coinID,
        currency,
        targetPrice: Number(targetPrice),
        condition,
      });
      toast.success(`Alert set — ${coinID.toUpperCase()} ${condition} ${CURRENCY_SYMBOLS[currency]}${targetPrice}`);
      setTargetPrice("");
      onAlertsChange();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.message ?? "Failed to create alert";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAlert(id: string) {
    try {
      await axios.delete(`${API}/api/alerts/${id}`);
      toast.success("Alert deleted");
      onAlertsChange();
    } catch {
      toast.error("Failed to delete alert");
    }
  }

  async function resetAlert(id: string) {
    try {
      await axios.patch(`${API}/api/alerts/${id}/reset`);
      toast.success("Alert reset — will fire again");
      onAlertsChange();
    } catch {
      toast.error("Failed to reset alert");
    }
  }

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency.toUpperCase();

  return (
    <div className="space-y-5">
      {/* Create form */}
      <form onSubmit={createAlert} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Coin</label>
            <select
              value={coinID}
              onChange={(e) => setCoinID(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
            >
              {POPULAR_COINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as "above" | "below")}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition"
            >
              <option value="above">Goes above</option>
              <option value="below">Falls below</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Target price ({symbol})
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={`e.g. ${symbol}50000`}
              min="0"
              step="any"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
        >
          {submitting ? "Setting alert..." : "Set Alert"}
        </button>
      </form>

      {/* Alert list */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            Active alerts ({alerts.length})
          </p>
          {alerts.map((a) => (
            <div
              key={a._id}
              className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                a.triggered
                  ? "bg-emerald-950 border-emerald-800"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <div>
                <span className="text-slate-200 font-medium">
                  {a.coinID.toUpperCase()}
                </span>
                <span className="text-slate-400 ml-2">
                  {a.condition}{" "}
                  {CURRENCY_SYMBOLS[a.currency] ?? a.currency.toUpperCase()}
                  {a.targetPrice.toLocaleString()}
                </span>
                {a.triggered && (
                  <span className="ml-2 text-xs text-emerald-400 font-medium">
                    Triggered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {a.triggered && (
                  <button
                    onClick={() => resetAlert(a._id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => deleteAlert(a._id)}
                  className="text-xs text-slate-500 hover:text-red-400 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}