import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities


def calculate_pagerank(G: nx.DiGraph) -> dict[str, float]:
    try:
        return nx.pagerank(G, weight="weight", max_iter=300, tol=1e-6)
    except nx.PowerIterationFailedConvergence:
        return {n: 1.0 / max(len(G.nodes()), 1) for n in G.nodes()}


def calculate_betweenness_centrality(G: nx.DiGraph) -> dict[str, float]:
    if len(G.nodes()) == 0:
        return {}
    return nx.betweenness_centrality(G, weight="weight", normalized=True)


def detect_communities(G: nx.DiGraph) -> list[list[str]]:
    if len(G.nodes()) == 0:
        return []
    undirected = G.to_undirected()
    try:
        comms = list(greedy_modularity_communities(undirected))
        return [sorted(list(c)) for c in comms]
    except Exception:
        return [[n] for n in G.nodes()]


def find_hidden_influencers(G: nx.DiGraph) -> list[str]:
    if len(G.nodes()) < 2:
        return list(G.nodes())
    betweenness = calculate_betweenness_centrality(G)
    degree      = dict(G.degree())
    scores: dict[str, float] = {}
    for node in G.nodes():
        b = betweenness.get(node, 0.0)
        d = max(degree.get(node, 1), 1)
        scores[node] = b / d
    return [n for n, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:5]]


def find_shortest_influence_path(G: nx.DiGraph, source: str, target: str) -> list[str]:
    try:
        return list(nx.shortest_path(G, source, target))
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return []


def find_manipulation_chains(G: nx.DiGraph, source: str, targets: list[str]) -> list[list[str]]:
    return [p for t in targets if (p := find_shortest_influence_path(G, source, t))]
