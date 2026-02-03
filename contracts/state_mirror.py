# contracts/state_mirror.py
import genlayer.gl as gl
from genlayer.gl.storage import TreeMap, DynArray
from datetime import datetime
from typing import Any

class StateMirror(gl.Contract):
    """
    State Mirror & Insight Contract - Premium Version

    Features:
    - Mirrors internal metrics and flags safely
    - Keeps detailed historical logs with timestamps
    - Highlights metrics crossing dynamic thresholds
    - Supports multiple highlight levels (INFO/WARNING/CRITICAL)
    - Emits events for SDK dashboards or listeners
    - Batch updates, toggles, and snapshotting
    - Extensible hooks for integration
    """

    # ----------------------
    # Core State
    # ----------------------
    metrics = TreeMap[str, int]()
    flags = TreeMap[str, bool]()
    history_keys = TreeMap[str, DynArray]()
    highlights = DynArray[str]()
    thresholds = TreeMap[str, int]()       # Custom thresholds per metric
    levels = TreeMap[str, str]()           # Highlight level: INFO / WARNING / CRITICAL

    # ----------------------
    # Public Read-Only Views
    # ----------------------
    @gl.public.view
    def get_metric(self, key: str) -> int | None:
        return self.metrics.get(key)

    @gl.public.view
    def get_flag(self, key: str) -> bool | None:
        return self.flags.get(key)

    @gl.public.view
    def get_all_metrics(self) -> dict[str, int]:
        return {k: self.metrics[k] for k in self.metrics.items()}

    @gl.public.view
    def get_history(self, key: str) -> list[str]:
        arr = self.history_keys.get(key)
        return [item for item in arr] if arr else []

    @gl.public.view
    def get_highlights(self) -> list[str]:
        return [msg for msg in self.highlights]

    @gl.public.view
    def get_threshold(self, key: str) -> int | None:
        return self.thresholds.get(key)

    @gl.public.view
    def get_level(self, key: str) -> str | None:
        return self.levels.get(key)

    # ----------------------
    # Internal Helpers
    # ----------------------
    def _record_history(self, key: str, value: Any) -> None:
        arr = self.history_keys.get(key)
        if arr is None:
            arr = DynArray[str]()
            self.history_keys[key] = arr
        timestamp = datetime.utcnow().isoformat()
        arr.append(f"{timestamp} → {value}")

    def _emit_highlight(self, key: str, value: int, level: str) -> None:
        msg = f"[{level}] {key} crossed threshold → {value}"
        self.highlights.append(msg)
        gl.event.emit("Highlight", {"key": key, "value": value, "level": level})

    def _check_highlight(self, key: str, value: int) -> None:
        threshold = self.thresholds.get(key, 1000)  # fallback
        level = self.levels.get(key, "INFO")
        if isinstance(value, int) and value > threshold:
            self._emit_highlight(key, value, level)
            # Call developer hook
            self.on_highlight(key, value, level)

    # ----------------------
    # Public Write Methods
    # ----------------------
    @gl.public.write
    def update_metric(self, key: str, value: int) -> None:
        self.metrics[key] = value
        self._record_history(key, value)
        self._check_highlight(key, value)

    @gl.public.write
    def batch_update_metrics(self, updates: dict[str, int]) -> None:
        for k, v in updates.items():
            self.update_metric(k, v)

    @gl.public.write
    def toggle_flag(self, key: str, status: bool) -> None:
        self.flags[key] = status
        self._record_history(key, status)

    @gl.public.write
    def batch_toggle_flags(self, updates: dict[str, bool]) -> None:
        for k, v in updates.items():
            self.toggle_flag(k, v)

    @gl.public.write
    def snapshot_state(self) -> None:
        for k in self.metrics:
            self._record_history(k, self.metrics[k])
        for k in self.flags:
            self._record_history(k, self.flags[k])

    @gl.public.write
    def set_threshold(self, key: str, value: int, level: str = "INFO") -> None:
        if value < 0:
            raise ValueError("Threshold must be >= 0")
        self.thresholds[key] = value
        self.levels[key] = level

    # ----------------------
    # Extensible Hooks
    # ----------------------
    def on_highlight(self, key: str, value: int, level: str) -> None:
        """
        Optional hook for developers to override.
        Called whenever a metric crosses its threshold.
        Can be used for notifications, external triggers, etc.
        """
        pass

    # ----------------------
    # Optional Utilities
    # ----------------------
    @gl.public.view
    def get_all_flags(self) -> dict[str, bool]:
        return {k: self.flags[k] for k in self.flags.items()}

    @gl.public.view
    def get_all_thresholds(self) -> dict[str, int]:
        return {k: self.thresholds[k] for k in self.thresholds.items()}

    @gl.public.view
    def get_all_levels(self) -> dict[str, str]:
        return {k: self.levels[k] for k in self.levels.items()}
