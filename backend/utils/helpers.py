import hashlib
from datetime import datetime, timezone


def stable_id(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()[:12]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))
