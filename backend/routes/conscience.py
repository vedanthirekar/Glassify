from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.claude_service import evaluate_conversation

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class UsageHistory(BaseModel):
    opens_today: int = 0
    opens_last_hour: int = 0
    time_of_day: str = "12:00"


class EvaluateRequest(BaseModel):
    app: str
    mood: int  # 1-5
    messages: list[Message]
    history: UsageHistory


@router.post("/evaluate")
async def evaluate(req: EvaluateRequest):
    if not 1 <= req.mood <= 5:
        raise HTTPException(status_code=422, detail="Mood must be between 1 and 5")
    if not req.messages:
        raise HTTPException(status_code=422, detail="Messages cannot be empty")

    result = evaluate_conversation(
        app=req.app,
        mood=req.mood,
        messages=[m.model_dump() for m in req.messages],
        opens_today=req.history.opens_today,
        opens_last_hour=req.history.opens_last_hour,
        time_of_day=req.history.time_of_day,
    )
    return result
