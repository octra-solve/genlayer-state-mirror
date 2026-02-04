import type { NextApiRequest, NextApiResponse } from "next";
import { execFile } from "child_process";

type StorageResponse = {
  status: string;
  storage?: string;
  tx_hash?: string;
  receipt_status?: string;
  receipt?: any;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StorageResponse>
) {
  const contractAddress = req.body?.contract_address || req.query?.contract_address;

  if (req.method === "GET") {
    // Call Python script to read storage
    execFile("python3", ["./api.py", "get_storage", contractAddress || ""], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ status: "error", error: stderr || error.message });
      }
      try {
        const data = JSON.parse(stdout);
        res.status(200).json({ status: "ok", storage: data.storage });
      } catch (e) {
        res.status(500).json({ status: "error", error: "Failed to parse Python output" });
      }
    });
  } else if (req.method === "POST") {
    const value = req.body?.value;
    if (!value) return res.status(400).json({ status: "error", error: "Missing value" });

    // Call Python script to update storage
    execFile("python3", ["./api.py", "update_storage", value, contractAddress || ""], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ status: "error", error: stderr || error.message });
      }
      try {
        const data = JSON.parse(stdout);
        res.status(200).json({ 
          status: "ok", 
          tx_hash: data.tx_hash, 
          receipt_status: data.receipt_status, 
          receipt: data.receipt 
        });
      } catch (e) {
        res.status(500).json({ status: "error", error: "Failed to parse Python output" });
      }
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
