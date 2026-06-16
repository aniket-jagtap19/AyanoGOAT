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
