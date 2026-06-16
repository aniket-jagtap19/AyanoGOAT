from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    source_character_id: str
    target_character_ids: list[str]
    strategy: str = Field(default="influence", pattern="^(influence|manipulation|alliance|observation|direct_influence)$")
    iterations: int = Field(default=15, ge=5, le=50)

class SimulationResult(BaseModel):
    source_id: str
    influence_scores: dict[str, float]
    manipulation_chains: list[list[str]]
    alliance_instability: dict[str, float]
    recommended_actions: list[str]
    timestamp: str

class AllianceRequest(BaseModel):
    node1_id: str
    node2_id: str
