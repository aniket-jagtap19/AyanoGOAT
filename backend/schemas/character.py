from pydantic import BaseModel

class Character(BaseModel):
    id: str
    name: str
    class_name: str
    description: str
    strategic_tendencies: list[str]
    trust_level: float
    influence_score: float
    faction: str
    personality_summary: str

class CharacterBrief(BaseModel):
    id: str
    name: str
    class_name: str
    faction: str
    influence_score: float
