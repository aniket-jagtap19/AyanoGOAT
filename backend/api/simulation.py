from fastapi import APIRouter, HTTPException
from services.simulation_service import run_simulation, predict_alliance
from schemas.simulation import SimulationRequest, SimulationResult, AllianceRequest

router = APIRouter()


@router.post("/run", response_model=SimulationResult)
def run_sim(req: SimulationRequest):
    try:
        return run_simulation(
            source_id=req.source_character_id,
            target_ids=req.target_character_ids,
            strategy=req.strategy,
            iterations=req.iterations,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alliance-stability")
def alliance_stability(req: AllianceRequest):
    return predict_alliance(req.node1_id, req.node2_id)
