from pydantic import BaseModel

class GraphNodeData(BaseModel):
    id: str
    name: str
    val: float
    color: str
    class_name: str
    influence_score: float
    faction: str

class GraphLinkData(BaseModel):
    source: str
    target: str
    weight: float
    rel_type: str
    trust: float
    confidence: float
    color: str

class GraphResponse(BaseModel):
    nodes: list[GraphNodeData]
    links: list[GraphLinkData]

class AnalyticsResponse(BaseModel):
    page_rank: dict[str, float]
    betweenness_centrality: dict[str, float]
    communities: list[list[str]]
    hidden_influencers: list[str]

# Project by Aniket Jagtap, time: - 2026-09-01 03:02:08
