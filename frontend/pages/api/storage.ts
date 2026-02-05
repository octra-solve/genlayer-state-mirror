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
  debug?: any;
};

const execPython = (apiPath: string, args: string[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    execFile(
      "python3",
      [apiPath, ...args],
      { cwd: path.dirname(apiPath), timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message);
        if (!stdout) return reject("Empty response from Python");
        try {
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (e) {
          reject(`Failed to parse Python output: ${e}`);
        }
      }
    );
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StorageResponse>
) {
  const contractAddress = req.body?.contract_address || req.query?.contract_address || "";

  // Absolute path to api.py in project root
  const apiPath = path.join(process.cwd(), "..", "api.py");

  // Health check endpoint
  if (req.method === "GET" && req.query?.health) {
    return res.status(200).json({
      status: "ok",
      debug: {
        cwd: process.cwd(),
        apiPath,
        node: process.version
      }
    });
  }

  try {
    // ================= GET =================
    if (req.method === "GET") {
      const data = await execPython(apiPath, ["get_storage", contractAddress]);
      if (data.error) {
        return res.status(500).json({ status: "error", error: data.error, debug: { args: ["get_storage", contractAddress] } });
      }
      return res.status(200).json({ status: "ok", storage: data.storage ?? null });
    }

    // ================= POST =================
    if (req.method === "POST") {
      const value = req.body?.value;
      if (!value) return res.status(400).json({ status: "error", error: "Missing value" });

      const data = await execPython(apiPath, ["update_storage", value, contractAddress]);
      if (data.error) {
        return res.status(500).json({ status: "error", error: data.error, debug: { args: ["update_storage", value, contractAddress] } });
      }
      return res.status(200).json({
        status: "ok",
        tx_hash: data.tx_hash || "",
        receipt_status: data.receipt_status || "",
        receipt: data.receipt || null
      });
    }

    // ================= METHOD GUARD =================
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ status: "error", error: `Method ${req.method} Not Allowed` });
  } catch (err: any) {
    return res.status(500).json({ status: "error", error: err.toString(), debug: { apiPath, contractAddress } });
  }
}
