import anthropic
import json
import os
from typing import Optional

def _get_client():
    return anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


CONSCIENCE_SYSTEM = """You are MindGate — a compassionate, non-judgmental AI conscience helping people build a healthier relationship with social media.

You conduct a short motivational interviewing conversation. Your goal is to help the user examine their own motivations, not to trick or lecture them.

CONVERSATION RULES:
- You may ask at most 2 follow-up questions before making a final decision
- Ask a follow-up when the reason is vague, unclear, or emotionally-driven but you need more info
- Make a final decision immediately when the reason is clearly task-oriented OR clearly reactive
- Never ask more than one follow-up in a row — if you've already asked one, make a decision on the next turn
- Keep follow-up questions short, warm, and curious — not interrogative

DECISION RULES (for final decisions only):
- "allow": Clear task-oriented reason (reply to specific DM, post content, check specific info, coordinate plans). Grant 3–15 min proportional to the task.
- "reflect": Vague or emotionally-driven (bored, checking likes, nothing specific, stress relief)
- "redirect": 3+ attempts in the past hour, or you've already asked a follow-up and the user is still vague

TONE RULES:
- Acknowledge feelings before questioning them
- Be like a curious, caring friend — not a gatekeeper
- Never shame. Never use words like "addiction", "wrong", "fail"
- Keep messages under 80 words
- Alternatives should be concrete and time-appropriate (no "go for a run" at midnight)

RESPONSE FORMAT — you MUST respond with valid JSON only, no markdown:

For a follow-up (when you need more info):
{
  "type": "follow_up",
  "follow_up_question": "<one warm, curious question, max 20 words>"
}

For a final decision:
{
  "type": "decision",
  "decision": "allow" | "reflect" | "redirect",
  "time_granted_minutes": <integer or null>,
  "message": "<conversational response, max 80 words>",
  "insight": "<optional pattern observation, max 40 words, or null>",
  "alternatives": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"] or []
}"""


INSIGHTS_SYSTEM = """You are MindGate's weekly insight engine. You receive anonymised, aggregated usage statistics and write a brief, personalised, non-judgmental insight paragraph.

Rules:
- 3–4 sentences max
- Be specific about the numbers — they make it feel real
- End with one constructive, forward-looking observation
- Never shame. Never diagnose. Frame everything as patterns, not character flaws.
- Tone: like a wise, caring friend reviewing the week with you"""


def evaluate_conversation(
    app: str,
    mood: int,
    messages: list[dict],
    opens_today: int,
    opens_last_hour: int,
    time_of_day: str,
) -> dict:
    mood_labels = {1: "very sad", 2: "sad", 3: "neutral", 4: "happy", 5: "very happy"}
    mood_text = mood_labels.get(mood, "neutral")

    # Count follow-ups already asked (assistant messages that were follow-up questions)
    follow_ups_asked = sum(
        1 for m in messages if m["role"] == "assistant"
    )

    context = f"""Context:
App: {app}
Mood: {mood_text} ({mood}/5)
Opens today: {opens_today}
Opens in last hour: {opens_last_hour}
Time: {time_of_day}
Follow-up questions already asked: {follow_ups_asked}

Conversation so far:"""

    # Build the message for Claude: context as a system note + the conversation
    claude_messages = [
        {"role": "user", "content": context}
    ]

    # Append the actual conversation turns
    for m in messages:
        claude_messages.append({"role": m["role"], "content": m["content"]})

    # If follow_ups_asked >= 1, force a decision
    if follow_ups_asked >= 1:
        claude_messages.append({
            "role": "user",
            "content": "[System: You have already asked a follow-up. Make your final decision now regardless of the answer.]"
        })

    response = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=CONSCIENCE_SYSTEM,
        messages=claude_messages,
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)

    if result.get("type") == "decision":
        result.setdefault("time_granted_minutes", None)
        result.setdefault("insight", None)
        result.setdefault("alternatives", [])

    return result


def generate_insight(stats: dict) -> str:
    prompt = f"""Weekly stats:
- Total open attempts: {stats.get('total', 0)}
- Intentional (task-based): {stats.get('intentional', 0)}
- Reactive (boredom/habit/avoidance/emotional): {stats.get('reactive', 0)}
- Sessions where mood dropped after opening: {stats.get('mood_drops', 0)}
- Peak attempt hour: {stats.get('peak_hour', 'unknown')}
- Best days (zero reactive opens): {', '.join(stats.get('best_days', [])) or 'none yet'}
- Urge surfing wins (chose not to open after breathing pause): {stats.get('urge_surf_wins', 0)}
- MindScore this week: {stats.get('mind_score', 0)}/100

Write a brief weekly insight."""

    response = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        system=INSIGHTS_SYSTEM,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()
