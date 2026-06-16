import networkx as nx
from datetime import datetime, timezone
from services.graph_service import build_nx_graph
from ml.analytics import find_manipulation_chains
from schemas.simulation import SimulationResult

_STRATEGY_MULT: dict[str, float] = {
    "manipulation": 1.35, "direct_influence": 1.15,
    "influence": 1.0,     "alliance": 0.85,
    "observation": 0.55,
}


def run_simulation(
    source_id: str,
    target_ids: list[str],
    strategy: str = "influence",
    iterations: int = 15,
) -> SimulationResult:
    G = build_nx_graph()
    if source_id not in G.nodes():
        raise ValueError(f"Character '{source_id}' not in graph")

    influence: dict[str, float] = {n: 0.0 for n in G.nodes()}
    influence[source_id] = 1.0
    decay = 0.10

    for _ in range(iterations):
        nxt: dict[str, float] = {}
        for node in G.nodes():
            nxt[node] = influence[node] * (1.0 - decay)
            for pred in G.predecessors(node):
                e  = G[pred][node]
                nxt[node] = min(
                    1.0,
                    nxt[node] + influence[pred] * e.get("weight", 0.5) * e.get("trust", 0.5) * 0.4,
                )
        influence = nxt

    mult = _STRATEGY_MULT.get(strategy, 1.0)
    influence = {k: round(min(1.0, v * mult), 4) for k, v in influence.items()}

    chains = find_manipulation_chains(G, source_id, target_ids)

    instability: dict[str, float] = {}
    for node in G.nodes():
        edges = list(G.edges(node, data=True))
        if edges:
            avg_trust = sum(d.get("trust", 0.5) for _, _, d in edges) / len(edges)
            instability[node] = round(1.0 - avg_trust, 3)
        else:
            instability[node] = 0.5

    recs = _recommendations(G, source_id, target_ids, influence, chains)

    return SimulationResult(
        source_id=source_id,
        influence_scores=influence,
        manipulation_chains=chains,
        alliance_instability=instability,
        recommended_actions=recs,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


def _recommendations(
    G: nx.DiGraph,
    source: str,
    targets: list[str],
    influence: dict[str, float],
    chains: list[list[str]],
) -> list[str]:
    recs: list[str] = []
    intermediaries: set[str] = {n for ch in chains for n in ch[1:-1]}
    for inter in sorted(intermediaries, key=lambda n: influence.get(n, 0), reverse=True)[:2]:
        name = G.nodes[inter].get("name", inter)
        recs.append(f"Cultivate {name} as strategic intermediary node")
    for target in targets:
        edges = list(G.edges(target, data=True))
        if edges:
            avg_trust = sum(d.get("trust", 0.5) for _, _, d in edges) / len(edges)
            if avg_trust < 0.35:
                name = G.nodes.get(target, {}).get("name", target)
                recs.append(f"Alliance around {name} is fragile — exploit instability")
    if any(influence.get(t, 0) < 0.08 for t in targets):
        recs.append("Direct reach insufficient. Deploy proxy influence through intermediaries")
    if not recs:
        recs.append("Current network topology is optimal — maintain observation posture")
    return recs[:5]


def predict_alliance(n1: str, n2: str) -> dict:
    G = build_nx_graph()
    if not G.has_edge(n1, n2):
        return {"stability": 0.0, "verdict": "No direct relationship exists"}
    e = G[n1][n2]
    trust  = float(e.get("trust",  0.5))
    weight = float(e.get("weight", 0.5))
    stability = round(trust * 0.7 + weight * 0.3, 3)
    r1 = {t for _, t, d in G.out_edges(n1, data=True) if d.get("rel_type") in ("RIVALS","DISTRUSTS")}
    r2 = {t for _, t, d in G.out_edges(n2, data=True) if d.get("rel_type") in ("RIVALS","DISTRUSTS")}
    common_rivals = list(r1 & r2)
    if common_rivals:
        stability = min(1.0, stability + 0.08 * len(common_rivals))
    verdict = (
        "Stable — reinforce through shared objectives" if stability > 0.65
        else "Fragile — monitor for defection signals" if stability > 0.35
        else "Volatile — expect eventual betrayal"
    )
    return {"stability": stability, "trust": trust, "weight": weight,
            "common_rivals": common_rivals, "verdict": verdict}
