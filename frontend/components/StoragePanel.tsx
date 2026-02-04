"use client";

import { useState } from "react";
import { getStorage, updateStorage } from "@/lib/api";

export default function StoragePanel() {
  const [storage, setStorage] = useState<string>("—");
  const [value, setValue] = useState("");
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleGet = async () => {
    try {
      setError(""); setStatus("⏳ Fetching storage…");
      const res = await getStorage();
      setStorage(res.value);
      setStatus("📡 Storage fetched!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setError(err.message); setStatus(""); 
    }
  };

  const handleUpdate = async () => {
    try {
      setError(""); setStatus("⏳ Sending tx…");
      const res = await updateStorage(Number(value));
      setTxHash(res.tx_hash);
      setStatus("✅ Tx sent!");
      setTimeout(() => setStatus(""), 4000);
    } catch (err: any) {
      setError(err.message); setStatus(""); 
    }
  };

  const copyTx = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setStatus("📋 Tx hash copied!");
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="panel glassmorphic">
      <h1>🌱 GenLayer Storage UI</h1>

      <div className="buttons">
        <button className="gradient-btn" onClick={handleGet}>Get Storage</button>
        <p>Current Value: <strong>{storage}</strong></p>
      </div>

      <input
        placeholder="New storage value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input-glow"
      />

      <div className="buttons">
        <button className="gradient-btn" onClick={handleUpdate}>Update Storage</button>
        {txHash && (
          <button className="copy-btn" onClick={copyTx}>Copy Tx Hash</button>
        )}
      </div>

      {status && <p className="status">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
