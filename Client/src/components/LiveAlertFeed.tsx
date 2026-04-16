import type { LiveAlert } from "../types";
import { CURRENCY_SYMBOLS } from "../constants/coins";

interface Props {
  alerts: LiveAlert[];
}

export default function LiveAlertFeed({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <p className="text-slate-600 text-xs text-center py-4">
        No alerts triggered yet
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {[...alerts].reverse().map((a, i) => {
        const symbol = CURRENCY_SYMBOLS[a.currency] ?? a.currency.toUpperCase();
        return (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 text-sm"
          >
            <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="text-slate-200 font-medium">
                {a.coin.toUpperCase()}
              </span>{" "}
              <span className="text-slate-400">
                hit {symbol}
                {a.currentPrice.toLocaleString()} — {a.condition}{" "}
                target {symbol}
                {a.target.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}