from pydantic import BaseModel, Field

class StrategistScenario(BaseModel):
    scenario_responses: list[str]
    strategic_choices: list[str]
    alliance_preference: float = Field(ge=0.0, le=1.0)
    manipulation_tendency: float = Field(ge=0.0, le=1.0)

class StrategistProfile(BaseModel):
    user_id: str
    archetype: str
    behavioral_embedding: list[float]
    trust_tendency: float
    manipulation_tendency: float
    alliance_tendency: float
    similar_characters: list[dict[str, float | str]]

class DecisionRecord(BaseModel):
    user_id: str
    context: str
    decision: str
    outcome: str
