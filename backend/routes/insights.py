from fastapi import APIRouter
from pydantic import BaseModel
from services.claude_service import generate_insight

router = APIRouter()


class InsightsRequest(BaseModel):
    total: int
    intentional: int
    reactive: int
    mood_drops: int
    peak_hour: str
    best_days: list[str]
    urge_surf_wins: int
    mind_score: int


class InsightsResponse(BaseModel):
    narrative: str


@router.post("/insights", response_model=InsightsResponse)
async def insights(req: InsightsRequest):
    narrative = generate_insight(req.model_dump())
    return {"narrative": narrative}
