# MindGate
### AI Conscience Layer for Social Media Addiction

---

## The Problem

The average person unlocks their phone 96 times a day. Most of those unlocks are unconscious — a reflex, not a choice. Social media platforms invest billions of dollars into making that reflex as automatic as possible: infinite scroll, variable reward, zero natural stopping points.

Existing solutions fail because they treat the symptom, not the cause:

| Solution | Why it fails |
|---|---|
| Screen Time / app limits | Users disable them the moment they're inconvenient |
| Hard blockers | People delete the blocker, not the app |
| Digital detox | Unsustainable; doesn't change underlying behaviour |
| Willpower alone | Willpower is finite; the algorithm is not |

The real problem isn't access to social media. It's the **absence of a moment to think** before the habit fires. Between the impulse and the action, there is no pause. MindGate creates one.

---

## The Solution

MindGate is a **conscience layer** — a compassionate AI that intercepts social media opens and starts a conversation before the app loads. Not a single question you can type through in two seconds, but a short dialogue that genuinely examines your intent.

It's not a wall. It's a mirror — built on three evidence-based techniques from clinical psychology.

### Psychological Foundation

1. **Friction reduces impulsive behaviour.** Even a brief cognitive interruption significantly reduces mindless opens. (Baumeister et al.)
2. **Affect labelling reduces emotional intensity.** Naming how you feel before acting activates the prefrontal cortex and weakens the automatic response. (Lieberman et al., UCLA)
3. **Motivational interviewing changes behaviour.** The clinical technique of open-ended questioning — used by therapists to help people examine their own motivations — is significantly more effective than confrontation or restriction.
4. **Urge surfing works.** ACT and mindfulness research shows 60–90% of urges pass if a person waits 60–90 seconds. The urge peaks and dissolves on its own.

MindGate operationalises all four.

---

## Who It's For

**Primary user:** Adults aged 16–30 who are self-aware about their phone use but struggle to change it. They've tried Screen Time. They've tried deleting the app. The behaviour comes back because the underlying trigger — boredom, anxiety, loneliness, procrastination — was never addressed.

This person doesn't need to be controlled. They need **metacognition at the moment of impulse** — awareness of their own mental state before the reflex takes over.

---

## How It Works

### The Full Flow

```
User taps Instagram
        ↓
MindGate intercepts
        ↓
Step 1 — Mood check-in
"How are you feeling right now?" (😔 😟 😐 🙂 😊)
        ↓
Step 2 — Motivational interviewing conversation
Claude asks why. If the answer is vague, it probes further.
Max 2 follow-ups, then a final decision is always made.
        ↓
        ├── ALLOW  → Grants timed access (e.g. 5 min to reply to a DM)
        │           Countdown timer starts
        │
        ├── REFLECT → Names the pattern, offers alternatives
        │             + "Try the 90-second pause" →
        │                 Guided breathing (4s inhale / 4s hold / 4s exhale)
        │                 After 90s: mood re-check
        │                 → Urge passed? Close. Still want it? Allowed.
        │
        └── REDIRECT → Firmer response, shows usage pattern
                       + same urge surfing option
        ↓
Step 3 (if allowed) — Countdown timer during session
        ↓
Step 4 — Post-session mood check-in
"How do you feel now?" — closes the feedback loop
        ↓
Session logged to local analytics
```

### Multi-turn Motivational Interviewing

The conscience conversation isn't a single question you type through. Claude conducts a short dialogue:

- **Clear, task-oriented reason** → Claude decides immediately
  *"I need to reply to a DM about tomorrow's plans" → Allowed, 5 min*

- **Vague or reactive reason** → Claude probes
  *"Just want to check" → "Check what specifically? Is there something you're hoping to find?"*

- **Still vague after follow-up** → Claude makes its decision with the full context

This is far harder to bypass than a single gate. It requires genuine articulation of intent.

### Speech Input

Users can speak their reason instead of typing it. The act of saying out loud *"I'm just bored"* is itself a cognitive intervention — it's harder to be dishonest with yourself when you hear your own words.

Uses the browser's built-in Web Speech API — no external service, no cost.

### Urge Surfing (90-second pause)

When Claude's decision is reflect or redirect, users are offered the 90-second pause:

- Animated breathing guide: 4s inhale, 4s hold, 4s exhale, cycling for 90 seconds
- Narrated phases: *"Inhale... Hold... Let it go..."*
- After 90s: *"How are you feeling now?"*
- If mood improved → encouragement and close option
- If unchanged → user is allowed through (the friction is already done)

Research shows the majority of urges pass within this window. The animation makes the wait feel purposeful rather than punitive.

### Decision Logic

Claude evaluates multiple signals together:

| Signal | What it tells us |
|---|---|
| Mood (1–5) | Emotional state at time of impulse |
| Conversation | Depth and specificity of stated intent |
| Time of day | Late-night opens treated differently than midday |
| Usage history | 1st attempt vs. 4th in an hour |

**Allow** — specific, task-oriented intent: reply to a named person, post content, check a specific event
**Reflect** — vague or emotionally-driven: "just bored", "nothing to do", "want to see if anyone liked my post"
**Redirect** — 3+ attempts in past hour, or pattern of reactive opens

---

## Features

### App Grid

**Conscience gate** (requires evaluation before opening):
Instagram, TikTok, X (Twitter), YouTube, Facebook, Reddit

**Direct open** (no gate — timer only):
Messages, Music, Camera, Maps, Calendar

**Utility:** MindGate settings panel

### Conscience Layer
- Mood check-in (emoji scale, optional context note)
- Multi-turn AI conversation — motivational interviewing, not a single gate
- Speech input via Web Speech API
- Structured AI decision with compassionate plain-language explanation
- Alternative activity suggestions matched to mood and time of day
- Emergency override always visible (logs the bypass, no hard block)

### Urge Surfing Mode
- 90-second guided breathing animation (4-4-4 cycle)
- Narrated phases with gentle prompts
- Post-pause mood re-check
- Win rate tracked: how often the urge passed without opening

### Timed Access
- Legitimate sessions granted 3–15 minutes based on the stated task
- Circular countdown timer visible during the session
- "Done early" option closes the session before the timer

### Post-Session Reflection
- Mood check-in after every session
- If mood drops, gently surfaces it: *"Scrolling left you feeling worse. That's useful to know."*
- Data stored for analytics — closes the before/after feedback loop

### Analytics — Behavioural Insights, Not Just Charts

Every visualisation answers a question the user didn't know they needed to ask.

**MindScore (0–100)** — weekly composite:
- 40 pts: % of opens that were intentional
- 30 pts: mood delta trend (positive = improving)
- 30 pts: days with zero reactive opens
- Shows week-over-week delta: *"+12 from last week"*

**The Mood Truth** — before/after line chart across all sessions
*"Your mood dropped after 68% of scroll sessions."*
This single number is often the most impactful thing in the app.

**Trigger Map** — 7-day × 24-hour heatmap
*"Your highest-risk hour is 22:00. Most opens on Sunday."*
Users instantly see their own danger zones.

**What's Behind Your Opens** — client-side reason classifier
Buckets session reasons into: Intentional / Boredom / Avoidance / Emotional / Habit
Runs entirely locally — no reason text leaves the device.
*Goal: watch Intentional grow and Habit shrink over weeks.*

**Urge Surfing Win Rate** — progress ring showing % of pauses where the urge passed
*"11 of 14 breathing pauses — you chose not to open the app."*

**Streak Counter** — consecutive days with zero reactive opens

**LLM Weekly Narrative** — anonymised stats sent to Claude, personalised insight returned:
*"This week you made 31 attempts. 18 happened after 9pm. Your mood dropped after 12 of those 18 sessions — that's a pattern worth paying attention to. Your best days were Tuesday and Thursday."*
This is what a therapist would say. Concrete, specific, non-judgmental.

### Settings Panel
- Personal note: "What am I trying to build?" — shared as context with Claude
- Triggers field: "What pulls me in most?" — informs the AI evaluation
- Per-app daily time limits (15 min – 2 hrs) for each social app
- Shows the user exactly what Claude will know about them before each session
- Stored in localStorage

### Privacy-First Design
- All session data stored in localStorage — nothing persists on any server
- Reason text is never stored server-side; only anonymised category counts sent for narrative
- No user accounts, no tracking, no external analytics
- Emergency override always available
- "Clear Session History" in the analytics dashboard resets all local data

---

## Technical Architecture

```
┌───────────────────────────────────────┐
│           Next.js 16 Frontend         │
│                                       │
│  Phone mockup simulation              │
│  ConscienceLayer state machine        │
│  Multi-turn chat interface            │
│  Web Speech API (speech input)        │
│  UrgeSurfing breathing component      │
│  Analytics dashboard (Recharts)       │
│  Client-side reason classifier        │
│  localStorage session store           │
└───────────────┬───────────────────────┘
                │ POST /api/evaluate
                │ (mood, messages[], history)
                │
                │ POST /api/insights
                │ (anonymised weekly stats)
┌───────────────▼───────────────────────┐
│           Python FastAPI              │
│                                       │
│  Multi-turn prompt engineering        │
│  follow_up | decision response types  │
│  Insights narrative endpoint          │
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│        Claude claude-sonnet-4-6       │
│                                       │
│  Motivational interviewing dialogue   │
│  Compassionate, contextually aware    │
│  Structured JSON output               │
│  Weekly insight narrative generation  │
└───────────────────────────────────────┘
```

**Stack:**
- Frontend: Next.js 16.2.1, React 19.2.4, Tailwind CSS 4, Recharts 3.8.1
- Backend: Python FastAPI
- AI: Anthropic Claude (`claude-sonnet-4-6`)
- Storage: localStorage (no external database)

---

## Running Locally

```bash
# Backend
cd mindgate/backend
cp .env.example .env    # add ANTHROPIC_API_KEY
uvicorn main:app --reload

# Frontend
cd mindgate/frontend
npm install
npm run dev
```

Frontend: http://localhost:3000 · Backend: http://localhost:8000

---

## Ethical Design

### Three core questions answered

**1. Who benefits, and who might be harmed?**

Benefits: users who want to change their relationship with their phone. The tool is opt-in, always transparent about what it's doing and why.

Potential harm: a user in crisis reaching for their phone for genuine support (contacting a friend during a mental health emergency) could be slowed down. Mitigation: the emergency override is always one tap away, always visible. MindGate is not a crisis tool and does not position itself as one.

**2. What could go wrong?**

| Risk | Mitigation |
|---|---|
| AI gives harmful advice | Prompt explicitly forbids prescriptive advice; always frames as observation, not instruction |
| Becomes a shame spiral | Every response is compassionate; words like "addiction", "fail", "wrong" are never used |
| Privacy violation | Reason text never stored server-side; only anonymised counts sent for narrative |
| User feels controlled | Emergency override always available; user has final say on every decision |
| Bad urge surfing experience | Skip button always visible; urge surfing is always optional, never forced |

**3. Does it empower people or make decisions for them?**

MindGate never makes a hard decision. It can reflect and redirect, but it cannot block. The user always has the final say. The goal is not compliance — it's **informed choice**. The AI provides context the user doesn't have in the moment (their mood, the time, the pattern behind their behaviour). What they do with that context is entirely up to them.

The multi-turn conversation is not an interrogation — it's an invitation to examine your own motivations, the way a good therapist would. Many users will choose to close the app themselves once they hear their own reason spoken or written back to them.

---

## Impact Potential

### Immediate (hackathon demo)
- Full conscience conversation flow end-to-end with real Claude responses
- Urge surfing with breathing animation
- Analytics dashboard with Mood Truth, Trigger Map, Reason Classifier, MindScore
- LLM-generated weekly insight from real session data

### Near-term (3–6 months)
- Browser extension intercepting real social media sites (no simulation needed)
- Mobile app with OS-level integration (Screen Time API on iOS, Digital Wellbeing API on Android)
- Scheduled "social media windows" users can pre-commit to

### Long-term
- Therapist dashboard: clinicians use anonymised MindGate session data as a conversation starting point — with full patient consent
- Research partnerships: the mood-before / mood-after delta at scale is genuinely novel data on social media's real-time emotional impact
- Integration with mental health apps (Woebot, Headspace, etc.) as a behavioural intervention layer

### Scale
- 2.5 billion social media users globally
- No distribution cost once built as a browser extension
- Fractions of a cent per evaluation — accessible at any scale
- Particularly high-impact in markets where mental health services are inaccessible or stigmatised

---

## What Makes This Different

| | Hard blockers | Screen Time | MindGate |
|---|---|---|---|
| Stops mindless use | ✓ (but gets disabled) | ✓ (but gets disabled) | ✓ (friction without blocking) |
| Respects autonomy | ✗ | ✗ | ✓ |
| Uses motivational interviewing | ✗ | ✗ | ✓ |
| Urge surfing technique | ✗ | ✗ | ✓ |
| Builds self-awareness | ✗ | ✗ | ✓ |
| Adapts to context | ✗ | ✗ | ✓ |
| Shows behavioural patterns | ✗ | Partial | ✓ |
| Mood impact data | ✗ | ✗ | ✓ |
| Works with legitimate use | ✗ | Partial | ✓ |
| Emergency access | ✗ | ✓ | ✓ |

The key insight: **the goal is not to stop people using social media. It is to make every open a choice rather than a reflex.** That's a fundamentally different design philosophy — and the only one that can work long-term.

---

## Team & Track

**Track:** Neuroscience & Mental Health
**Hackathon:** Claude Builder Club
**Powered by:** Anthropic Claude (`claude-sonnet-4-6`)
