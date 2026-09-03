from database.connection import get_driver
from typing import Any

def run_query(query: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    driver = get_driver()
    with driver.session() as session:
        result = session.run(query, params or {})
        return [dict(record) for record in result]

def run_single(query: str, params: dict[str, Any] | None = None) -> dict[str, Any] | None:
    rows = run_query(query, params)
    return rows[0] if rows else None

def run_write(query: str, params: dict[str, Any] | None = None) -> None:
    driver = get_driver()
    with driver.session() as session:
        session.run(query, params or {})

# Project by Aniket Jagtap, time: - 2026-09-03 09:48:45
