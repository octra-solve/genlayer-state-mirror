#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
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

CONTRACT_ADDRESS = "0x028c4cFf2BAf365C963D8F8c218A2884bB4100C5"

class StorageUpdate(BaseModel):
    value: str

# ---- Load account safely ----
try:
    with open(ACCOUNT_PATH, "r") as f:
        data = json.load(f)
    acct = create_account(data["private_key"])
except Exception as e:
    print(json.dumps({"error": f"Account load failed: {e}"}))
    sys.exit(1)

@app.get("/storage")
def get_storage():
    try:
        client = create_client(chain=studionet, account=acct)
        value = client.read_contract(
            address=CONTRACT_ADDRESS,
            function_name="get_storage",
            args=[]
        )
        return {"status": "ok", "storage": value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/storage")
def update_storage(data: StorageUpdate):
    try:
        client = create_client(chain=studionet, account=acct)
        tx_hash = client.write_contract(
            address=CONTRACT_ADDRESS,
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

# -------- CLI MODE (execFile) --------
if __name__ == "__main__":
    try:
        command = sys.argv[1]
        value = sys.argv[2] if len(sys.argv) > 2 else None
        address = sys.argv[3] if len(sys.argv) > 3 else CONTRACT_ADDRESS

        client = create_client(chain=studionet, account=acct)

        if command == "get_storage":
            v = client.read_contract(address=address, function_name="get_storage", args=[])
            print(json.dumps({"storage": v}))

        elif command == "update_storage":
            if not value:
                raise ValueError("Missing value for update_storage")

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
            raise ValueError("Unknown command")

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
