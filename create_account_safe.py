#!/usr/bin/env python3
from genlayer_py import create_account
import json

# Generate a new account
acct = create_account()

# Convert HexBytes to string
private_key_str = acct._private_key.hex() if hasattr(acct._private_key, 'hex') else str(acct._private_key)

# Prepare JSON-serializable data
data = {
    "private_key": private_key_str,
    "address": str(acct.address)   # ensure it's a string
}

# Write account info to account.json
with open("account.json", "w") as f:
    json.dump(data, f, indent=4)

print("✅ account.json created successfully!")
print(f"Address: {data['address']}")
