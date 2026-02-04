import type { NextApiRequest, NextApiResponse } from "next";
import { execFile } from "child_process";
import path from "path";

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

  // Absolute path to api.py in project root
  // Assumes frontend/ is inside project root
  const apiPath = path.join(process.cwd(), "..", "api.py");

  if (req.method === "GET") {
    execFile("python3", [apiPath, "get_storage", contractAddress || ""], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          status: "error",
          error: `Python execution failed: ${stderr || error.message}`
        });
      }
      try {
        const data = JSON.parse(stdout);
        if (!data.storage && data.error) {
          return res.status(500).json({ status: "error", error: data.error });
        }
        res.status(200).json({ status: "ok", storage: data.storage });
      } catch (e) {
        res.status(500).json({ status: "error", error: "Failed to parse Python output: " + e });
      }
    });
  } else if (req.method === "POST") {
    const value = req.body?.value;
    if (!value) return res.status(400).json({ status: "error", error: "Missing value" });

    execFile("python3", [apiPath, "update_storage", value, contractAddress || ""], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          status: "error",
          error: `Python execution failed: ${stderr || error.message}`
        });
      }
      try {
        const data = JSON.parse(stdout);
        if (data.error) {
          return res.status(500).json({ status: "error", error: data.error });
        }
        res.status(200).json({
          status: "ok",
          tx_hash: data.tx_hash || "",
          receipt_status: data.receipt_status || "",
          receipt: data.receipt || null
        });
      } catch (e) {
        res.status(500).json({ status: "error", error: "Failed to parse Python output: " + e });
      }
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
