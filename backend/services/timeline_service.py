from graph.neo4j_client import run_query, run_write


def get_all_events() -> list[dict]:
    rows = run_query("MATCH (e:Event) RETURN e ORDER BY e.season, e.day_offset")
    return [dict(r["e"]) for r in rows]


def get_events_by_season(season: int) -> list[dict]:
    rows = run_query(
        "MATCH (e:Event {season: $s}) RETURN e ORDER BY e.day_offset",
        {"s": season},
    )
    return [dict(r["e"]) for r in rows]


def advance_to_season(season: int) -> dict:
    run_write(
        """
        MATCH (a:Character)-[r]->(b:Character)
        WHERE r.season_threshold <= $s
        SET r.weight = r.weight * 0.9
        """,
        {"s": season},
    )
    events = get_events_by_season(season)
    return {
        "season": season,
        "events_applied": len(events),
        "message": f"Timeline advanced to season {season}",
    }
