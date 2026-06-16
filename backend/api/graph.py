from fastapi import APIRouter
from services.graph_service import get_full_graph, get_analytics, get_node2vec_embeddings
from schemas.graph import GraphResponse, AnalyticsResponse

router = APIRouter()


@router.get("/", response_model=GraphResponse)
def full_graph():
    return get_full_graph()


@router.get("/analytics", response_model=AnalyticsResponse)
def graph_analytics():
    return get_analytics()


@router.get("/embeddings")
def structural_embeddings():
    return get_node2vec_embeddings()


@router.get("/community-detection")
def community_detection():
    from services.graph_service import build_nx_graph
    from ml.analytics import detect_communities
    G     = build_nx_graph()
    comms = detect_communities(G)
    return {"communities": comms, "count": len(comms)}


@router.get("/hidden-influencers")
def hidden_influencers():
    from services.graph_service import build_nx_graph
    from ml.analytics import find_hidden_influencers
    G    = build_nx_graph()
    hi   = find_hidden_influencers(G)
    from graph.neo4j_client import run_query
    rows = run_query("MATCH (c:Character) WHERE c.id IN $ids RETURN c.id AS id, c.name AS name", {"ids": hi})
    return {"hidden_influencers": rows}
