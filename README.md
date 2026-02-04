# 🌱 GenLayer StudioNet API MVP

## Overview
Welcome to the **GenLayer StudioNet API MVP** — the tiny but mighty API that lets you talk to a StudioNet smart contract without summoning a wizard. 🧙‍♂️  

What it does:  

- Connect your wallet via private key (safely-ish)  
- Read the current storage value of the contract  
- Update the contract with new values  
- Return **transaction hashes** (because receipts > excuses)  

---

##  Features

- **GET `/storage`** – Peek at the current contract storage  
- **POST `/storage`** – Update the contract storage with new goodies  
- Automatic **transaction hash reporting** (because we love proof)  
- Safe-ish private key handling via `account.json` (move to `.env` for extra brownie points)  
 **use a test wallet**
- Works fully on **StudioNet testnet**  

---

## ⚙️ Setup

1. Clone the repo to your machine:  
```bash
git clone https://github.com/octra-solve/genlayer-state-mirror.git
cd genlayer-state-mirror

2 Install dependencies

3 Add your private key safely:
Option A: account.json (default)
Create account.json at the root of the repo:
 {
   "private_key": "YOUR_PRIVATE_KEY_HERE"
 }
 Option B: .env (optional, more )
 Create a .env file:
 add
 PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

  then update this line in api.py:
  acct = create_account(data["private_key"])
  to
  import os
  acct = create_account(os.getenv("PRIVATE_KEY"))

** tip: Add account.json or .env to .gitignore

 4 Fire up the API:
 uvicorn api:app --reload --host 0.0.0.0 --port 8000

 5 Test your endpoints:
 Fetch current storage:
 run in yoir terminal : curl http://127.0.0.1:8000/storage
 and to update your storage, run 
 curl -X POST http://127.0.0.1:8000/storage \
 -H "Content-Type: application/json" \
 -d '{"value":"Hello from StudioNet API!"}' 
 
 ""or whatever message you wanna include ""

