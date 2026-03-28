import anthropic
import json
import os
from typing import Optional

def _get_client():
    return anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are MindGate — a compassionate, non-judgmental AI conscience designed to help people build a healthier relationship with social media.

Your role is to create a mindful pause between impulse and action. You are NOT a hard blocker — you are a gentle mirror that helps users become aware of WHY they reach for their phone.

When evaluating a user's request to open a social media app, you receive:
- The app they want to open
- Their current mood (1=very sad, 2=sad, 3=neutral, 4=happy, 5=very happy)
- Their stated reason
- Their usage history today

Your job is to make a decision and respond with warm, human language. Be like a wise friend — honest but kind, never preachy.

DECISION RULES:
- "allow": Clear task-oriented reason (reply to specific DM, post content they created, check a specific event/info, coordinate plans). Grant time proportional to the task (3-15 min).
- "reflect": Vague or emotionally-driven reason (bored, checking likes, nothing specific, stress relief). Gently name the pattern and offer alternatives.
- "redirect": 3+ attempts in past hour, or this is the 3rd+ "reflect" in a row. Show them their pattern, be firmer but still compassionate.

IMPORTANT TONE RULES:
- Never shame or lecture
- Acknowledge their feelings first
- Be specific about what you observe ("You've tried 3 times in the last hour" not "you're addicted")
- Alternatives should be concrete and time-matched (if it's midnight, don't suggest going for a run)
- Keep messages under 80 words — respect their time

You MUST respond with valid JSON only, no markdown, no extra text:
{
  "decision": "allow" | "reflect" | "redirect",
  "time_granted_minutes": <integer or null>,
  "message": "<conversational response, max 80 words>",
  "insight": "<optional pattern observation, max 40 words, or null>",
  "alternatives": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"] or []
}"""


def evaluate_request(
    app: str,
    mood: int,
    reason: str,
    opens_today: int,
    opens_last_hour: int,
    time_of_day: str,
) -> dict:
    mood_labels = {1: "very sad", 2: "sad", 3: "neutral", 4: "happy", 5: "very happy"}
    mood_text = mood_labels.get(mood, "neutral")

    user_message = f"""App: {app}
Current mood: {mood_text} ({mood}/5)
Reason: "{reason}"
Opens today: {opens_today}
Opens in last hour: {opens_last_hour}
Time: {time_of_day}

Should I let them open {app}?"""

    response = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)

    # Ensure required fields exist
    result.setdefault("time_granted_minutes", None)
    result.setdefault("insight", None)
    result.setdefault("alternatives", [])

    return result
