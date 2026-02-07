#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import json
import sys
import os
from genlayer_py import create_client, create_account
from genlayer_py.chains import studionet
from genlayer_py.types import TransactionStatus

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ACCOUNT_PATH = os.path.join(BASE_DIR, "account.json")

class StorageUpdate(BaseModel):
    value: str
    address: str

# ---- Load account safely (env fallback for Render) ----
try:
    ACCOUNT_JSON = os.environ.get("ACCOUNT_JSON")
    if ACCOUNT_JSON:
        data = json.loads(ACCOUNT_JSON)
    else:
        with open(ACCOUNT_PATH, "r") as f:
            data = json.load(f)
    acct = create_account(data["private_key"])
except Exception as e:
    print(json.dumps({"error": f"Account load failed: {e}"}))
    sys.exit(1)

# ----------------- API ENDPOINTS -----------------

@app.get("/storage")
async def get_storage(address: str):
    try:
        client = create_client(chain=studionet, account=acct)
        value = client.read_contract(
            address=address,
            function_name="get_storage",
            args=[]
        )
        return {"status": "ok", "storage": value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/storage")
async def update_storage(data: StorageUpdate):
    try:
        client = create_client(chain=studionet, account=acct)
        tx_hash = client.write_contract(
            address=data.address,
            function_name="update_storage",
            args=[data.value],
            value=0
        )
        receipt = client.wait_for_transaction_receipt(
            transaction_hash=tx_hash,
            status=TransactionStatus.ACCEPTED
        )
        return {
            "status": "ok",
            "tx_hash": tx_hash,
            "receipt_status": receipt.get("status"),
            "receipt": receipt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- CLI MODE -----------------
if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise ValueError("Missing command. Use 'get_storage' or 'update_storage'.")

        command = sys.argv[1].lower()

        # Parse CLI args dynamically
        if command == "get_storage":
            if len(sys.argv) < 3:
                raise ValueError("Missing contract address for get_storage")
            address = sys.argv[2]
            client = create_client(chain=studionet, account=acct)
            value = client.read_contract(address=address, function_name="get_storage", args=[])
            print(json.dumps({"storage": value}))

        elif command == "update_storage":
            if len(sys.argv) < 4:
                raise ValueError("Usage: update_storage <value> <contract_address>")
            value = sys.argv[2]
            address = sys.argv[3]
            client = create_client(chain=studionet, account=acct)
            tx_hash = client.write_contract(
                address=address,
                function_name="update_storage",
                args=[value],
                value=0
            )
            receipt = client.wait_for_transaction_receipt(
                transaction_hash=tx_hash,
                status=TransactionStatus.ACCEPTED
            )
            print(json.dumps({
                "tx_hash": tx_hash,
                "receipt_status": receipt.get("status"),
                "receipt": receipt
            }))
        else:
            raise ValueError(f"Unknown command '{command}'")

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
