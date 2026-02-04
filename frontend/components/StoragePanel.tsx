"use client";

import { useState } from "react";
import { getStorage, updateStorage } from "../lib/api";

export default function StoragePanel() {
  const [storage, setStorage] = useState<string>("—");
  const [value, setValue] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressUpdate, setAddressUpdate] = useState("");

  // Separate states per action
  const [loadingGetDefault, setLoadingGetDefault] = useState(false);
  const [loadingGetByAddress, setLoadingGetByAddress] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [errorGetDefault, setErrorGetDefault] = useState("");
  const [errorGetByAddress, setErrorGetByAddress] = useState("");
  const [errorUpdate, setErrorUpdate] = useState("");

  const [txHash, setTxHash] = useState("");

  // ------------------------
  // Default storage query
  // ------------------------
  const handleGetDefault = async () => {
    setLoadingGetDefault(true);
    setErrorGetDefault("");
    setTxHash("");
    try {
      const res = await getStorage();
      setStorage(res.storage);
    } catch (err: any) {
      setErrorGetDefault("⚠️ " + err.message);
    } finally {
      setLoadingGetDefault(false);
    }
  };

  // ------------------------
  // Query storage by contract address
  // ------------------------
  const handleGetByAddress = async () => {
    if (!addressQuery) return setErrorGetByAddress("⚠️ Enter contract address to query!");
    setLoadingGetByAddress(true);
    setErrorGetByAddress("");
    setTxHash("");
    try {
      const res = await getStorage(addressQuery);
      setStorage(res.storage);
    } catch (err: any) {
      setErrorGetByAddress("⚠️ " + err.message);
    } finally {
      setLoadingGetByAddress(false);
    }
  };

  // ------------------------
  // Update storage (default or custom)
  // ------------------------
  const handleUpdate = async () => {
    if (!value) return setErrorUpdate("⚠️ Enter a value to store!");
    setLoadingUpdate(true);
    setErrorUpdate("");
    setTxHash("");
    try {
      const res = await updateStorage(value, addressUpdate || undefined);
      setTxHash(res.tx_hash ?? "");
      setStorage(value);
      setValue("");
      setAddressUpdate("");
    } catch (err: any) {
      setErrorUpdate("💥 " + err.message);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="panel">
      <h1>🌱 GenLayer Storage UI</h1>
      <p className="subtext">Push values on-chain without touching CLI. Pure vibes.</p>

      {/* Default storage query */}
      <button
        className="action-btn"
        onClick={handleGetDefault}
        disabled={loadingGetDefault}
      >
        {loadingGetDefault ? "⏳ Loading..." : "Get Current Storage"}
      </button>
      {errorGetDefault && <p className="error">{errorGetDefault}</p>}

      {/* Query by custom contract address */}
      <input
        type="text"
        placeholder="Contract address to query"
        value={addressQuery}
        onChange={(e) => setAddressQuery(e.target.value)}
        disabled={loadingGetByAddress}
      />
      <button
        className="action-btn"
        onClick={handleGetByAddress}
        disabled={loadingGetByAddress}
      >
        {loadingGetByAddress ? "⏳ Querying..." : "Query Storage by Address"}
      </button>
      {errorGetByAddress && <p className="error">{errorGetByAddress}</p>}

      {/* Update storage (default or custom) */}
      <input
        type="text"
        placeholder="New storage value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loadingUpdate}
      />
      <input
        type="text"
        placeholder="Contract address to update (optional)"
        value={addressUpdate}
        onChange={(e) => setAddressUpdate(e.target.value)}
        disabled={loadingUpdate}
      />
      <button
        className="action-btn"
        onClick={handleUpdate}
        disabled={loadingUpdate}
      >
        {loadingUpdate ? "⏳ Sending..." : "Update Storage"}
      </button>
      {errorUpdate && <p className="error">{errorUpdate}</p>}

      {/* Feedback */}
      {txHash && <p className="success">✅ Tx Hash: {txHash}</p>}

      <p className="status">
        Current Value: <strong>{storage}</strong>
      </p>
    </div>
  );
}
