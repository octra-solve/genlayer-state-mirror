#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import sys
from genlayer_py import create_client, create_account
from genlayer_py.chains import studionet
from genlayer_py.types import TransactionStatus

app = FastAPI()

CONTRACT_ADDRESS = "0x028c4cFf2BAf365C963D8F8c218A2884bB4100C5"

class StorageUpdate(BaseModel):
    value: str

# Load the private key from account.json
with open("account.json", "r") as f:
    data = json.load(f)

# Create account object — *official usage*
acct = create_account(data["private_key"])

@app.get("/")
def root():
    return {"status": "ok", "message": "GenLayer StudioNet API running"}

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
        raise HTTPException(status_code=500, detail=f"Failed to read storage: {e}")

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
            "receipt_status": receipt.get("status") if isinstance(receipt, dict) else None,
            "receipt": receipt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update storage: {e}")

# -----------------------------
# CLI mode for execFile support
# -----------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="GenLayer CLI for storage")
    parser.add_argument("command", choices=["get_storage", "update_storage"])
    parser.add_argument("value_or_address", nargs="?", default=None)
    parser.add_argument("contract_address", nargs="?", default=CONTRACT_ADDRESS)
    args = parser.parse_args()

    client = create_client(chain=studionet, account=acct)
    try:
        if args.command == "get_storage":
            value = client.read_contract(
                address=args.contract_address,
                function_name="get_storage",
                args=[]
            )
            print(json.dumps({"storage": value}))
        elif args.command == "update_storage":
            if not args.value_or_address:
                raise ValueError("Missing value for update_storage")
            tx_hash = client.write_contract(
                address=args.contract_address,
                function_name="update_storage",
                args=[args.value_or_address],
                value=0
            )
            receipt = client.wait_for_transaction_receipt(
                transaction_hash=tx_hash,
                status=TransactionStatus.ACCEPTED
            )
            print(json.dumps({
                "tx_hash": tx_hash,
                "receipt_status": receipt.get("status") if isinstance(receipt, dict) else None,
                "receipt": receipt
            }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
