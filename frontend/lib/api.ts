/**
 * GenLayer Storage API Client
 * Connects frontend to GenLayer StudioNet backend (Python script via Next.js API)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // <- added

type StorageResponse = {
  status: string;
  storage: string;
  error?: string;
};

type UpdateResponse = {
  status: string;
  tx_hash?: string;
  receipt_status?: string;
  receipt?: any;
  error?: string;
};

/**
 * Fetch current storage value from backend
 * @param contractAddress Optional address to query
 */
export async function getStorage(contractAddress?: string): Promise<StorageResponse> {
  const url = contractAddress
    ? `${API_BASE}/storage?address=${contractAddress}`
    : `${API_BASE}/storage`; 
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("Failed to fetch storage: " + msg);
  }

  const data: StorageResponse = await res.json();
  if (data.status !== "ok") throw new Error(data.error || "Unknown error");
  return data;
}

/**
 * Update storage value on backend
 * @param value The new storage value as string
 * @param contractAddress Optional address to update
 */
export async function updateStorage(value: string, contractAddress?: string): Promise<UpdateResponse> {
  const body: any = { value };
  if (contractAddress) body.address = contractAddress; // <- updated to match backend

  const res = await fetch(`${API_BASE}/storage`, { // <- updated
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("Failed to update storage: " + msg);
  }

  const data: UpdateResponse = await res.json();
  if (data.status !== "ok") throw new Error(data.error || "Unknown error");
  return data;
}
