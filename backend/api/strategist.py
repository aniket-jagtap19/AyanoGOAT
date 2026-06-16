from fastapi import APIRouter, HTTPException
from graph.neo4j_client import run_write, run_single
from services.embedding_service import compute_strategist_embedding, find_similar_to_query
from schemas.strategist import StrategistProfile

router = APIRouter()

_cache: dict[str, dict] = {}


def _archetype(manipulation: float, alliance: float) -> str:
    if manipulation > 0.75 and alliance < 0.35:
        return "The Phantom"
    if manipulation > 0.70 and alliance >= 0.35:
        return "The Architect"
    if manipulation < 0.30 and alliance > 0.70:
        return "The Diplomat"
    if manipulation < 0.30 and alliance < 0.30:
        return "The Observer"
    if 0.30 <= manipulation <= 0.65 and alliance > 0.60:
        return "The Tactician"
    if 0.30 <= manipulation <= 0.65 and alliance <= 0.30:
        return "The Enforcer"
    return "The Sovereign"


@router.post("/profile", response_model=StrategistProfile)
def create_profile(data: dict):
    user_id            = str(data.get("user_id", "user_default"))
    scenario_responses = [str(s) for s in data.get("scenario_responses", [])]
    strategic_choices  = [str(s) for s in data.get("strategic_choices", [])]
    alliance_pref      = float(data.get("alliance_preference", 0.5))
    manip_tend         = float(data.get("manipulation_tendency", 0.5))

    embedding  = compute_strategist_embedding(scenario_responses, strategic_choices)
    query_text = " ".join(scenario_responses + strategic_choices)
    similar    = find_similar_to_query(query_text, top_k=5)
    arch       = _archetype(manip_tend, alliance_pref)
    trust      = round(max(0.0, 1.0 - manip_tend * 0.65), 3)

    profile = StrategistProfile(
        user_id=user_id,
        archetype=arch,
        behavioral_embedding=embedding[:32],
        trust_tendency=trust,
        manipulation_tendency=round(manip_tend, 3),
        alliance_tendency=round(alliance_pref, 3),
        similar_characters=similar[:5],
    )
    _cache[user_id] = profile.model_dump()

    run_write(
        """
        MERGE (u:User {id: $uid})
        SET u.archetype = $arch, u.manipulation = $manip, u.alliance = $ally, u.trust = $trust
        """,
        {"uid": user_id, "arch": arch, "manip": manip_tend, "ally": alliance_pref, "trust": trust},
    )
    return profile


@router.get("/{user_id}", response_model=StrategistProfile)
def get_profile(user_id: str):
    if user_id in _cache:
        return StrategistProfile(**_cache[user_id])
    row = run_single("MATCH (u:User {id: $uid}) RETURN u", {"uid": user_id})
    if not row:
        raise HTTPException(status_code=404, detail=f"Profile '{user_id}' not found")
    u = dict(row["u"])
    return StrategistProfile(
        user_id=user_id,
        archetype=str(u.get("archetype", "Unknown")),
        behavioral_embedding=[],
        trust_tendency=float(u.get("trust", 0.5)),
        manipulation_tendency=float(u.get("manipulation", 0.5)),
        alliance_tendency=float(u.get("alliance", 0.5)),
        similar_characters=[],
    )
