// frontend/pages/api/storage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { execFile } from "child_process";
import path from "path";

export type StorageResponse = {
  status: string;
  storage?: string | null;
  tx_hash?: string;
  receipt_status?: string;
  receipt?: any;
  error?: string;
  debug?: any;
  warning?: string;
  result?: any;
};

const execPython = (apiPath: string, args: string[]): Promise<any> =>
  new Promise((resolve, reject) => {
    execFile(
      "python3",
      [apiPath, ...args],
      { cwd: path.dirname(apiPath), timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message);
        if (!stdout) return reject("Empty response from Python");
        try {
          resolve(JSON.parse(stdout));
        } catch (e: any) {
          reject(`Failed to parse Python output: ${e}`);
        }
      }
    );
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StorageResponse>
) {
  const contractAddress = req.body?.contract_address || req.query?.contract_address || "";
  const apiPath = path.join(process.cwd(), "..", "api.py");

  if (req.method === "GET" && req.query?.health) {
    return res.status(200).json({ status: "ok", debug: { cwd: process.cwd(), apiPath, node: process.version } });
  }

  try {
    if (req.method === "GET") {
      const data = await execPython(apiPath, ["get_storage", contractAddress]);
      if (data.error) return res.status(500).json({ status: "error", error: data.error, debug: { args: ["get_storage", contractAddress] } });
      return res.status(200).json({ status: "ok", storage: data.storage ?? null });
    }

    if (req.method === "POST") {
      const value = req.body?.value;
      if (!value) return res.status(400).json({ status: "error", error: "Missing value" });
      const data = await execPython(apiPath, ["update_storage", value, contractAddress]);
      if (data.error) return res.status(500).json({ status: "error", error: data.error, debug: { args: ["update_storage", value, contractAddress] } });
      return res.status(200).json({ status: "ok", tx_hash: data.tx_hash ?? "", receipt_status: data.receipt_status ?? "", receipt: data.receipt ?? null });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ status: "error", error: `Method ${req.method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ status: "error", error: err?.toString() ?? "Unknown error", debug: { apiPath, contractAddress } });
  }
}
