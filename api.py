#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
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

        # 1️⃣ Send transaction
        tx_hash = client.write_contract(
            address=CONTRACT_ADDRESS,
            function_name="update_storage",
            args=[data.value],
            value=0
        )

        # 2️⃣ Wait for transaction to be accepted/finalized
        #    Use ACCEPTED or FINALIZED depending on how much confirmation info you want
        receipt = client.wait_for_transaction_receipt(
            transaction_hash=tx_hash,
            status=TransactionStatus.ACCEPTED
        )

        # 3️⃣ Return receipt + block info
        return {
            "status": "ok",
            "tx_hash": tx_hash,
            "receipt_status": receipt.get("status") if isinstance(receipt, dict) else None,
            "receipt": receipt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update storage: {e}")
