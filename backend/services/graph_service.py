import networkx as nx
from graph.neo4j_client import run_query
from ml import analytics as mla
from ml import node2vec_model as n2v
from schemas.graph import GraphResponse, GraphNodeData, GraphLinkData, AnalyticsResponse

CLASS_COLORS: dict[str, str] = {
    "A": "#fbbf24", "B": "#34d399", "C": "#f87171",
    "D": "#60a5fa", "Teacher": "#a78bfa", "Council": "#e879f9"
}
REL_COLORS: dict[str, str] = {
    "MANIPULATES": "#f87171", "ALLIES_WITH": "#34d399", "RIVALS": "#fb923c",
    "PROTECTS": "#60a5fa",   "DECEIVES":   "#e879f9", "DISTRUSTS": "#94a3b8",
    "INFLUENCES": "#fbbf24",
}


def get_full_graph() -> GraphResponse:
    chars = run_query("MATCH (c:Character) RETURN c")
    rels  = run_query(
        "MATCH (a:Character)-[r]->(b:Character) "
        "RETURN a.id AS source, b.id AS target, "
        "type(r) AS rel_type, r.weight AS weight, "
        "r.trust AS trust, r.confidence AS confidence"
    )

    nodes = [
        GraphNodeData(
            id=c["id"],
            name=c["name"],
            val=float(c.get("influence_score", 0.5)) * 10,
            color=CLASS_COLORS.get(c.get("class_name", ""), "#9ca3af"),
            class_name=c.get("class_name", "Unknown"),
            influence_score=float(c.get("influence_score", 0.5)),
            faction=c.get("faction", "Unknown"),
        )
        for r in chars
        for c in [dict(r["c"])]
    ]

    links = [
        GraphLinkData(
            source=str(r["source"]),
            target=str(r["target"]),
            weight=float(r["weight"] or 0.5),
            rel_type=str(r["rel_type"]),
            trust=float(r["trust"] or 0.5),
            confidence=float(r["confidence"] or 0.5),
            color=REL_COLORS.get(str(r["rel_type"]), "#6b7280"),
        )
        for r in rels
    ]

    return GraphResponse(nodes=nodes, links=links)


def get_analytics() -> AnalyticsResponse:
    G  = build_nx_graph()
    pr = mla.calculate_pagerank(G)
    bc = mla.calculate_betweenness_centrality(G)
    cm = mla.detect_communities(G)
    hi = mla.find_hidden_influencers(G)
    return AnalyticsResponse(
        page_rank=pr, betweenness_centrality=bc,
        communities=cm, hidden_influencers=hi,
    )


def build_nx_graph() -> nx.DiGraph:
    G = nx.DiGraph()
    for r in run_query("MATCH (c:Character) RETURN c"):
        c = dict(r["c"])
        G.add_node(c["id"], **c)
    for r in run_query(
        "MATCH (a:Character)-[r]->(b:Character) "
        "RETURN a.id AS src, b.id AS tgt, "
        "type(r) AS rel_type, r.weight AS w, r.trust AS t"
    ):
        G.add_edge(
            r["src"], r["tgt"],
            weight=float(r["w"] or 0.5),
            trust=float(r["t"] or 0.5),
            rel_type=r["rel_type"],
        )
    return G


def get_node2vec_embeddings() -> dict[str, list[float]]:
    G = build_nx_graph()
    return n2v.compute_embeddings(G)
