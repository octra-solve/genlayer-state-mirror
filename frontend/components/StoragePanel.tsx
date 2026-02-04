"use client";

import { useState } from "react";
import { getStorage, updateStorage } from "../lib/api";

export default function StoragePanel() {
  const [storage, setStorage] = useState<string | number>("—");
  const [value, setValue] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGet = async () => {
    setLoading(true);
    setError("");
    setTxHash("");
    try {
      const res = await getStorage();
      setStorage(res.value); 
    } catch (err: any) {
      setError("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!value) return setError("⚠️ Enter a value to store!");
    setLoading(true);
    setError("");
    setTxHash("");
    try {
      const res = await updateStorage(Number(value));
      setTxHash(res.tx_hash);
      setStorage(value);
      setValue("");
    } catch (err: any) {
      setError("💥 " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h1>🌱 GenLayer Storage UI</h1>
      <p className="subtext">Push values on-chain without touching CLI. Pure vibes.</p>

      <button className="action-btn" onClick={handleGet} disabled={loading}>
        {loading ? "⏳ Loading..." : "Get Current Storage"}
      </button>

      <p className="status">
        Current Value: <strong>{storage}</strong>
      </p>

      <input
        type="number"
        placeholder="New storage value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
      />

      <button className="action-btn" onClick={handleUpdate} disabled={loading}>
        {loading ? "⏳ Sending..." : "Update Storage"}
      </button>

      {txHash && <p className="success">✅ Tx Hash: {txHash}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
