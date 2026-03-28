from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.claude_service import evaluate_request

router = APIRouter()


class UsageHistory(BaseModel):
    opens_today: int = 0
    opens_last_hour: int = 0
    time_of_day: str = "12:00"


class EvaluateRequest(BaseModel):
    app: str
    mood: int  # 1-5
    reason: str
    history: UsageHistory


class EvaluateResponse(BaseModel):
    decision: str  # "allow" | "reflect" | "redirect"
    time_granted_minutes: Optional[int]
    message: str
    insight: Optional[str]
    alternatives: list[str]


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest):
    if not 1 <= req.mood <= 5:
        raise HTTPException(status_code=422, detail="Mood must be between 1 and 5")
    if not req.reason.strip():
        raise HTTPException(status_code=422, detail="Reason cannot be empty")

    result = evaluate_request(
        app=req.app,
        mood=req.mood,
        reason=req.reason,
        opens_today=req.history.opens_today,
        opens_last_hour=req.history.opens_last_hour,
        time_of_day=req.history.time_of_day,
    )
    return result
