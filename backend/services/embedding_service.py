from __future__ import annotations
from graph.neo4j_client import run_query
from ml.embeddings import encode_text, find_most_similar, cosine_similarity

_cache: dict[str, list[float]] = {}


def _build_cache() -> dict[str, list[float]]:
    global _cache
    if _cache:
        return _cache
    chars = run_query("MATCH (c:Character) RETURN c")
    for r in chars:
        c = dict(r["c"])
        text = (
            f"{c.get('name', '')} "
            f"{c.get('description', '')} "
            f"{c.get('personality_summary', '')} "
            + " ".join(c.get("strategic_tendencies", []))
        )
        _cache[c["id"]] = encode_text(text)
    return _cache


def compare_characters(id1: str, id2: str) -> dict:
    embs = _build_cache()
    if id1 not in embs or id2 not in embs:
        return {"similarity": 0.0, "error": "Character not found"}
    sim = cosine_similarity(embs[id1], embs[id2])
    return {"character_id_1": id1, "character_id_2": id2, "similarity": round(sim, 4)}


def find_similar_to_query(query_text: str, top_k: int = 5) -> list[dict]:
    embs   = _build_cache()
    q_emb  = encode_text(query_text)
    ranked = find_most_similar(q_emb, embs)
    top    = ranked[:top_k]
    char_map = {
        dict(r["c"])["id"]: dict(r["c"])
        for r in run_query("MATCH (c:Character) RETURN c")
    }
    for item in top:
        cid = str(item["id"])
        if cid in char_map:
            item["name"]    = char_map[cid].get("name", "")
            item["faction"] = char_map[cid].get("faction", "")
    return top


def compute_strategist_embedding(
    scenario_responses: list[str],
    strategic_choices:  list[str],
) -> list[float]:
    combined = " ".join(scenario_responses + strategic_choices)
    return encode_text(combined)
