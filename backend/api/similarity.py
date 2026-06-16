from fastapi import APIRouter
from services.embedding_service import compare_characters, find_similar_to_query

router = APIRouter()


@router.post("/compare")
def compare(body: dict):
    return compare_characters(str(body.get("character_id_1", "")), str(body.get("character_id_2", "")))


@router.post("/find")
def find_similar(body: dict):
    return find_similar_to_query(str(body.get("query_text", "")), int(body.get("top_k", 5)))


@router.get("/archetypes")
def archetypes():
    return {"archetypes": [
        {"id": "phantom",    "name": "The Phantom",    "description": "Manipulates from total invisibility. No detectable footprint."},
        {"id": "architect",  "name": "The Architect",  "description": "Constructs multi-layered influence systems with long time horizons."},
        {"id": "diplomat",   "name": "The Diplomat",   "description": "Builds genuine alliances. Strength through mutual trust."},
        {"id": "observer",   "name": "The Observer",   "description": "Collects intelligence. Acts only when certainty is absolute."},
        {"id": "tactician",  "name": "The Tactician",  "description": "Adaptive strategist. Balances manipulation and alliance fluidly."},
        {"id": "enforcer",   "name": "The Enforcer",   "description": "Dominates through discipline and direct confrontation."},
        {"id": "sovereign",  "name": "The Sovereign",  "description": "Self-sufficient. Refuses all dependency structures."},
    ]}
