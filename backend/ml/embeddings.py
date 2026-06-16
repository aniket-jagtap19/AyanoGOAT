from __future__ import annotations
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity as sk_cos

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def encode_text(text: str) -> list[float]:
    return _get_model().encode([text])[0].tolist()


def encode_texts(texts: list[str]) -> list[list[float]]:
    return _get_model().encode(texts).tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va = np.array(a).reshape(1, -1)
    vb = np.array(b).reshape(1, -1)
    return float(sk_cos(va, vb)[0][0])


def find_most_similar(
    query: list[float], corpus: dict[str, list[float]]
) -> list[dict[str, float | str]]:
    results = [
        {"id": k, "similarity": cosine_similarity(query, v)}
        for k, v in corpus.items()
    ]
    return sorted(results, key=lambda x: float(x["similarity"]), reverse=True)
