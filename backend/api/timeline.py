from fastapi import APIRouter
from services.timeline_service import get_all_events, get_events_by_season, advance_to_season

router = APIRouter()


@router.get("/events")
def all_events():
    return get_all_events()


@router.get("/events/{season}")
def events_by_season(season: int):
    return get_events_by_season(season)


@router.post("/advance")
def advance(body: dict):
    season = int(body.get("season", 1))
    return advance_to_season(season)
