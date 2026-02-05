"use client";

import { useState } from "react";
import type { StorageResponse } from "../pages/api/storage";
import { getStorage, updateStorage } from "../lib/api";

export default function StoragePanel() {
  // ---------- STATES ----------
  const [getContract, setGetContract] = useState<string>("");       
  const [queryContract, setQueryContract] = useState<string>("");   
  const [updateContract, setUpdateContract] = useState<string>(""); 
  const [updateValue, setUpdateValue] = useState<string>("");       
  const [storage, setStorage] = useState<string>("—");              
  const [txHash, setTxHash] = useState<string>("");                 
  const [warning, setWarning] = useState<string>("");               

  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [errorGet, setErrorGet] = useState<string>("");
  const [errorQuery, setErrorQuery] = useState<string>("");
  const [errorUpdate, setErrorUpdate] = useState<string>("");

  // ---------- HANDLERS ----------
  const handleGetStorage = async () => {
    if (!getContract) return setErrorGet("⚠️ Enter a contract address!");
    setLoadingGet(true); setErrorGet(""); setTxHash(""); setWarning("");
    try {
      const res: StorageResponse = await getStorage(getContract);
      if (res.warning) setWarning(res.warning);
      setStorage(res.storage ?? "—");
    } catch (err: any) {
      setErrorGet("⚠️ " + (err.message ?? err.toString()));
    } finally { setLoadingGet(false); }
  };

  const handleQueryStorage = async () => {
    if (!queryContract) return setErrorQuery("⚠️ Enter a contract address!");
    setLoadingQuery(true); setErrorQuery(""); setTxHash(""); setWarning("");
    try {
      const res: StorageResponse = await getStorage(queryContract);
      if (res.warning) setWarning(res.warning);
      setStorage(res.storage ?? "—");
    } catch (err: any) {
      setErrorQuery("⚠️ " + (err.message ?? err.toString()));
    } finally { setLoadingQuery(false); }
  };

  const handleUpdateStorage = async () => {
    if (!updateValue) return setErrorUpdate("⚠️ Enter a value to store!");
    setLoadingUpdate(true); setErrorUpdate(""); setTxHash(""); setWarning("");
    try {
      const res: StorageResponse = await updateStorage(updateValue, updateContract || undefined);
      setTxHash(res.tx_hash ?? "");
      setStorage(updateValue);
      setUpdateValue(""); setUpdateContract("");
    } catch (err: any) {
      setErrorUpdate("💥 " + (err.message ?? err.toString()));
    } finally { setLoadingUpdate(false); }
  };

  // ---------- UI ----------
  return (
    <div className="panel-wrapper">
      <h1>🌱 GenLayer Storage UI</h1>

      <div className="panel">
        <h2>Get Current Storage</h2>
        <input type="text" placeholder="Enter contract address" value={getContract} onChange={e => setGetContract(e.target.value)} />
        <button onClick={handleGetStorage} disabled={loadingGet} className="action-btn">
          {loadingGet ? "⏳ Loading..." : "Get Current Storage"}
        </button>
        {errorGet && <p className="error">{errorGet}</p>}
      </div>

      <div className="panel">
        <h2>Query Storage by Address</h2>
        <input type="text" placeholder="Contract address to query" value={queryContract} onChange={e => setQueryContract(e.target.value)} />
        <button onClick={handleQueryStorage} disabled={loadingQuery} className="action-btn">
          {loadingQuery ? "⏳ Querying..." : "Query Storage"}
        </button>
        {errorQuery && <p className="error">{errorQuery}</p>}
      </div>

      <div className="panel">
        <h2>Update Storage</h2>
        <input type="text" placeholder="New storage value" value={updateValue} onChange={e => setUpdateValue(e.target.value)} />
        <input type="text" placeholder="Contract address to update (optional)" value={updateContract} onChange={e => setUpdateContract(e.target.value)} />
        <button onClick={handleUpdateStorage} disabled={loadingUpdate} className="action-btn">
          {loadingUpdate ? "⏳ Sending..." : "Update Storage"}
        </button>
        {errorUpdate && <p className="error">{errorUpdate}</p>}
      </div>

      {txHash && <p className="success">✅ Tx Hash: {txHash}</p>}
      {warning && <p className="status">{warning}</p>}
      <p className="status">Current Value: <strong>{storage}</strong></p>
    </div>
  );
}
