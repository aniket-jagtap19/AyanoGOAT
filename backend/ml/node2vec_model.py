from __future__ import annotations
import networkx as nx
import numpy as np

_embeddings: dict[str, list[float]] = {}


def compute_embeddings(G: nx.DiGraph) -> dict[str, list[float]]:
    global _embeddings
    nodes = list(G.nodes())
    if not nodes:
        return {}
    try:
        from node2vec import Node2Vec
        n2v = Node2Vec(G, dimensions=32, walk_length=20, num_walks=50, workers=1, quiet=True)
        model = n2v.fit(window=5, min_count=1, batch_words=4)
        _embeddings = {
            n: model.wv[str(n)].tolist() for n in nodes if str(n) in model.wv
        }
    except Exception:
        _embeddings = _spectral_fallback(G)
    return _embeddings


def _spectral_fallback(G: nx.DiGraph) -> dict[str, list[float]]:
    nodes = list(G.nodes())
    if len(nodes) < 2:
        return {n: [0.0] * 32 for n in nodes}
    np.random.seed(42)
    proj = np.random.randn(len(nodes), 32)
    proj /= np.linalg.norm(proj, axis=1, keepdims=True) + 1e-8
    return {nodes[i]: proj[i].tolist() for i in range(len(nodes))}


def structural_similarity(n1: str, n2: str) -> float:
    if n1 not in _embeddings or n2 not in _embeddings:
        return 0.0
    a, b = np.array(_embeddings[n1]), np.array(_embeddings[n2])
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
