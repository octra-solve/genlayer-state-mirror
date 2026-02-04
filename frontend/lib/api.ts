/**
 * GenLayer Storage API (Internal Next.js)
 * Handles storage fetch/update without requiring external uvicorn server.
 * Premium, auto-handled internal calls.
 */

type StorageResponse = { value: number };
type UpdateResponse = { tx_hash: string };

/**
 * Fetch current storage value
 * @param contractAddress optional contract address
 */
export async function getStorage(contractAddress?: string): Promise<StorageResponse> {
  const body = contractAddress ? { contract_address: contractAddress } : {};
  
  const res = await fetch("/api/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("Failed to fetch storage: " + msg);
  }

  return res.json();
}

/**
 * Update storage value
 * @param value the new value to store
 * @param contractAddress optional contract address
 */
export async function updateStorage(value: number, contractAddress?: string): Promise<UpdateResponse> {
  const body: any = { value };
  if (contractAddress) body.contract_address = contractAddress;

  const res = await fetch("/api/storage/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("Failed to update storage: " + msg);
  }

  return res.json();
}
