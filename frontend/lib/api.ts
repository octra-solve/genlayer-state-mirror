const API_BASE = "http://localhost:8000"; // Change if your API server is elsewhere

export async function getStorage() {
  const res = await fetch(`${API_BASE}/storage`);
  if (!res.ok) throw new Error("Failed to fetch storage");
  return res.json();
}

export async function updateStorage(value: number) {
  const res = await fetch(`${API_BASE}/storage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Failed to update storage");
  return res.json();
}
