from fastapi import APIRouter, HTTPException
from graph.neo4j_client import run_query
from schemas.character import Character, CharacterBrief
from services.graph_service import build_nx_graph
from ml.analytics import find_shortest_influence_path

router = APIRouter()


@router.get("/", response_model=list[CharacterBrief])
def list_characters():
    rows = run_query("MATCH (c:Character) RETURN c ORDER BY c.influence_score DESC")
    return [
        CharacterBrief(
            id=c["id"],
            name=c["name"],
            class_name=c.get("class_name", "Unknown"),
            faction=c.get("faction", "Unknown"),
            influence_score=float(c.get("influence_score", 0.5)),
        )
        for row in rows
        for c in [dict(row["c"])]
    ]


@router.get("/{character_id}", response_model=Character)
def get_character(character_id: str):
    rows = run_query("MATCH (c:Character {id: $id}) RETURN c", {"id": character_id})
    if not rows:
        raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")
    c = dict(rows[0]["c"])
    return Character(
        id=c["id"],
        name=c["name"],
        class_name=c.get("class_name", "Unknown"),
        description=c.get("description", ""),
        strategic_tendencies=list(c.get("strategic_tendencies", [])),
        trust_level=float(c.get("trust_level", 0.5)),
        influence_score=float(c.get("influence_score", 0.5)),
        faction=c.get("faction", "Unknown"),
        personality_summary=c.get("personality_summary", ""),
    )


@router.get("/{character_id}/relationships")
def get_relationships(character_id: str):
    rows = run_query(
        """
        MATCH (a:Character {id: $id})-[r]->(b:Character)
        RETURN b.id AS target_id, b.name AS target_name,
               type(r) AS rel_type, r.weight AS weight,
               r.trust AS trust, r.confidence AS confidence
        """,
        {"id": character_id},
    )
    return rows


@router.get("/{source_id}/influence-path/{target_id}")
def influence_path(source_id: str, target_id: str):
    G    = build_nx_graph()
    path = find_shortest_influence_path(G, source_id, target_id)
    if not path:
        return {"path": [], "found": False}
    names = {
        r["id"]: r["name"]
        for r in run_query(
            "MATCH (c:Character) WHERE c.id IN $ids RETURN c.id AS id, c.name AS name",
            {"ids": path},
        )
    }
    return {
        "path":   [{"id": p, "name": names.get(p, p)} for p in path],
        "found":  True,
        "length": len(path) - 1,
    }


@router.post("/{character_id}/interact")
def interact(character_id: str, payload: dict):
    rows = run_query("MATCH (c:Character {id: $id}) RETURN c", {"id": character_id})
    if not rows:
        raise HTTPException(status_code=404, detail="Character not found")
    c          = dict(rows[0]["c"])
    user_msg   = str(payload.get("message", ""))
    trust      = float(payload.get("trust_level", 0.5))
    response   = _build_response(c, user_msg, trust)
    return {"character_id": character_id, "character_name": c["name"], "response": response}


def _build_response(c: dict, msg: str, trust: float) -> str:
    name       = c.get("name", "Unknown")
    tendencies = list(c.get("strategic_tendencies", []))
    tone       = "direct" if trust > 0.7 else "measured" if trust > 0.35 else "guarded"

    lines: dict[str, dict[str, str]] = {
        "manipulation": {
            "guarded":  f"Every interaction is a transaction. Specify your terms.",
            "measured": f"Your intentions remain opaque. Elaborate—carefully.",
            "direct":   f"I've modeled three outcomes from this conversation already. Proceed.",
        },
        "deception": {
            "guarded":  f"Fascinating. Your openness tells me exactly where your vulnerabilities are.",
            "measured": f"I rarely reveal my true evaluation. But I'm listening.",
            "direct":   f"You've earned a partial truth. Make use of it.",
        },
        "loyalty": {
            "guarded":  f"Trust is constructed through action, not words.",
            "measured": f"I'm inclined to cooperate—under the right conditions.",
            "direct":   f"You have my support. I protect those in my circle.",
        },
        "discipline": {
            "guarded":  f"Your approach lacks rigor. Return when you have a concrete proposition.",
            "measured": f"Acceptable. Present your data and I will assess objectively.",
            "direct":   f"Your performance has been noted. Here is my analysis:",
        },
    }

    for key, responses in lines.items():
        if key in tendencies:
            return f"[{name}] {responses[tone]}"

    return f"[{name}] I observe. What you've revealed here is more than you intended."
