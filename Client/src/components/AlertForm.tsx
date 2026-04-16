import React, { useState } from "react";
import axios from "axios";

//Predefined popular coins
const popularCoins = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
  { id: "ethereum", symbol: "eth", name: "Ethereum" },
  { id: "solana", symbol: "sol", name: "Solana" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin" },
  { id: "cardano", symbol: "ada", name: "Cardano" },
  { id: "ripple", symbol: "xrp", name: "XRP" },
];

const popularCurrencies = [
  { code: "usd", name: "US Dollar" },
  { code: "inr", name: "Indian Rupee" },
  { code: "eur", name: "Euro" },
  { code: "gbp", name: "British Pound" },
  { code: "jpy", name: "Japanese Yen" },
];

const AlertForm: React.FC = () => {
  const [coinID, setCoin] = useState("bitcoin");
  const [currency, setCurrency] = useState("usd");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");
  const [message, setMessage] = useState("");

  const createAlert = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/alerts`, {
        coinID,
        currency,
        targetPrice: Number(targetPrice),
        condition,
      });
      setMessage("Alert created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to create alert");
    }
  };

  return (
    <div>
      <h2>Create Alert</h2>

      <label>Select Coin:</label>
      <select
        value={coinID}
        onChange={(e) => setCoin(e.target.value)}
      >
        {popularCoins.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.symbol.toUpperCase()})
          </option>
        ))}
      </select>

      <label>Select Currency:</label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        {popularCurrencies.map((cur) => (
          <option key={cur.code} value={cur.code}>
            {cur.name} ({cur.code.toUpperCase()})
          </option>
        ))}
      </select>

      <label>Target Price:</label>
      <input
        type="number"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        placeholder="Enter target price"
      />


      <label>Condition:</label>
      <select
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      >
        <option value="above">Above</option>
        <option value="below">Below</option>
      </select>

      <button
        onClick={createAlert}
      >
        Set Alert
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AlertForm;
