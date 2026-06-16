from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import graph, characters, simulation, strategist, similarity, timeline

app = FastAPI(
    title="Ayanokoji Protocol API",
    description="Strategic social-network simulator — White Room Intelligence Terminal",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router,       prefix="/graph",       tags=["Graph"])
app.include_router(characters.router,  prefix="/characters",  tags=["Characters"])
app.include_router(simulation.router,  prefix="/simulation",  tags=["Simulation"])
app.include_router(strategist.router,  prefix="/strategist",  tags=["Strategist"])
app.include_router(similarity.router,  prefix="/similarity",  tags=["Similarity"])
app.include_router(timeline.router,    prefix="/timeline",    tags=["Timeline"])

@app.get("/health")
def health():
    return {"status": "operational", "system": "AYANOKOJI PROTOCOL v1.0"}
