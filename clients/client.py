# client.py
from genlayer.gl.client import ContractClient
from contracts.state_mirror import StateMirror
from typing import Any
import time
import json

# ----------------------
# Config: replace with your deployed contract address
# ----------------------
CONTRACT_ADDRESS = "0xa647f2B8A5A753BA8D213fC022faB74e1d947967"

# Create a client instance
client = ContractClient(CONTRACT_ADDRESS, StateMirror)

# ----------------------
# Helper Functions
# ----------------------
def safe_get_metric(key: str, default: int = 0) -> int:
    """
    Fetch metric safely, fallback to default if missing.
    Auto-creates metric if it doesn't exist.
    """
    value = client.view.get_metric(key)
    if value is None:
        print(f"[Info] Metric '{key}' not found. Setting default {default}.")
        client.tx.update_metric(key, default)
        return default
    return value


def safe_get_flag(key: str, default: bool = False) -> bool:
    """
    Fetch flag safely, fallback to default if missing.
    Auto-creates flag if it doesn't exist.
    """
    value = client.view.get_flag(key)
    if value is None:
        print(f"[Info] Flag '{key}' not found. Setting default {default}.")
        client.tx.toggle_flag(key, default)
        return default
    return value


def safe_set_threshold(key: str, threshold: int = 1000) -> None:
    """
    Ensure a threshold exists for a metric. Sets default if missing.
    """
    current = client.view.get_threshold(key)
    if current is None:
        print(f"[Info] Threshold for '{key}' not set. Auto-setting to {threshold}.")
        client.tx.set_threshold(key, threshold)


# ----------------------
# Pretty Print Helpers
# ----------------------
def print_metrics():
    all_metrics = client.view.get_all_metrics()
    print("\n[Metrics Snapshot]")
    for k, v in all_metrics.items():
        print(f" - {k}: {v}")


def print_highlights():
    highlights = client.view.get_highlights()
    if not highlights:
        print("\n[No highlights yet]")
        return
    print("\n[Highlights]")
    for h in highlights:
        print(" -", h)


def print_history(key: str):
    history = client.view.get_history(key)
    if not history:
        print(f"\n[No history for '{key}']")
        return
    print(f"\n[History for '{key}']")
    for entry in history:
        print(" -", entry)


# ----------------------
# Batch Operations
# ----------------------
def batch_update_metrics(updates: dict[str, int]) -> None:
    """
    Batch update metrics with automatic threshold checks.
    """
    for k, v in updates.items():
        safe_set_threshold(k)
    client.tx.batch_update_metrics(updates)
    print(f"[Info] Batch metrics updated: {updates}")


def batch_toggle_flags(flags: dict[str, bool]) -> None:
    """
    Batch toggle flags safely.
    """
    client.tx.batch_toggle_flags(flags)
    print(f"[Info] Batch flags updated: {flags}")


# ----------------------
# Auto Snapshot
# ----------------------
def snapshot_state():
    """
    Snapshot full contract state to history.
    """
    client.tx.snapshot_state()
    print("[Info] Full state snapshot recorded.")


# ----------------------
# Event Polling / Subscription
# ----------------------
def poll_highlights(interval: int = 5):
    """
    Poll highlights periodically and print new ones.
    """
    seen = set()
    print("[Info] Starting highlight polling...")
    try:
        while True:
            highlights = client.view.get_highlights()
            new = [h for h in highlights if h not in seen]
            for h in new:
                print("[Highlight]", h)
                seen.add(h)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("[Info] Highlight polling stopped by user.")


# ----------------------
# JSON Export / Analytics
# ----------------------
def export_state(file: str = "state_export.json") -> None:
    """
    Export full contract state (metrics, flags, highlights, thresholds, history) to JSON.
    """
    data = {
        "metrics": client.view.get_all_metrics(),
        "flags": {k: safe_get_flag(k) for k in client.view.flags.items()},
        "thresholds": {k: client.view.get_threshold(k) for k in client.view.thresholds.items()},
        "highlights": client.view.get_highlights(),
        "history": {k: client.view.get_history(k) for k in client.view.history_keys.items()},
    }
    with open(file, "w") as f:
        json.dump(data, f, indent=4)
    print(f"[Info] Contract state exported to {file}")


# ----------------------
# CLI / Interactive Demo
# ----------------------
if __name__ == "__main__":
    print_metrics()
    print_highlights()
    batch_update_metrics({"score": 1500, "level": 10, "xp": 2500})
    batch_toggle_flags({"premium_user": True, "tutorial_completed": False})
    snapshot_state()
    print_metrics()
    print_highlights()
    export_state()
    print_history("score")
