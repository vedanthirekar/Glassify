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

MindGate is a **conscience layer** — a compassionate AI that intercepts social media opens and asks a single question before the app loads:

> *"Why do you want to open this right now?"*

That question, asked at the right moment every time, shifts users from reactive to intentional. It's not a wall. It's a mirror.

### Core Insight
Behavioural psychology tells us three things that MindGate is built around:

1. **Friction reduces impulsive behaviour.** Even a 3-second cognitive interruption significantly reduces mindless opens.
2. **Labelling an emotion reduces its intensity.** Naming how you feel before acting — "I'm bored, I'm anxious" — activates the prefrontal cortex and weakens the automatic response. (Lieberman et al., UCLA)
3. **Implementation intention predicts behaviour.** Stating a specific reason before an action dramatically increases the likelihood the action is intentional and goal-directed.

MindGate operationalises all three.

---

## Who It's For

**Primary user:** Adults aged 16–30 who are self-aware about their phone use but struggle to change it. They've tried Screen Time. They've tried deleting the app. The behaviour comes back because the underlying trigger — boredom, anxiety, loneliness, procrastination — was never addressed.

This person doesn't need to be controlled. They need **metacognition at the moment of impulse** — awareness of their own mental state before the reflex takes over.

**Why they'd use MindGate over alternatives:**
- It doesn't block them — it respects their autonomy
- It explains its reasoning in plain language
- It adapts to context (late night vs. midday; task-oriented vs. aimless)
- It shows them their own patterns over time

---

## How It Works

### The Flow

```
User taps Instagram
        ↓
MindGate intercepts
        ↓
Step 1 — Mood check-in
"How are you feeling right now?" (😔 😟 😐 🙂 😊)
        ↓
Step 2 — Reason prompt
"What's the plan — what do you want to do there?"
        ↓
Step 3 — AI evaluation
Claude analyses: mood + reason + time of day + usage history
        ↓
        ├── ALLOW  → Grants timed access (e.g. 5 min to reply to a DM)
        ├── REFLECT → Names the pattern, offers alternatives
        └── REDIRECT → Shows usage data, firmer pushback on 3rd+ attempt
        ↓
Step 4 (if allowed) — Countdown timer
        ↓
Step 5 — Post-session check-in
"Did you do what you came to do? How do you feel now?"
        ↓
Analytics updated
```

### Decision Logic

The AI evaluates three signals together — never in isolation:

| Signal | What it tells us |
|---|---|
| Mood score (1–5) | Emotional state at time of impulse |
| Stated reason | Task-oriented vs. aimless vs. avoidant |
| Usage history | First open vs. 4th open in an hour |

**Allow** — clear task: reply to a specific message, post content, check event details, coordinate plans
**Reflect** — vague or emotionally-driven: "just bored", "want to check likes", "nothing to do"
**Redirect** — 3+ attempts in past hour, or repeat emotional pattern (e.g. opening during stress)

### Resistance Tiers
The system gets progressively firmer across attempts, without ever becoming hostile:
- **1st attempt:** gentle, conversational, may allow
- **2nd attempt within 1 hour:** shows the pattern ("You've tried twice in the last hour")
- **3rd+ attempt:** displays their usage data directly, asks them to reflect on it

---

## Features

### Conscience Layer
- Mood check-in with optional context note
- LLM conversation asking for intent
- Structured AI decision with empathetic plain-language explanation
- Alternative activity suggestions matched to mood and time of day
- Emergency override always available (adds friction, logs the bypass)

### Timed Access
- When a reason is legitimate, access is granted for a specific window (3–15 min)
- Circular countdown timer visible during the session
- Timer calibrated to the stated task (replying to a DM = shorter than posting content)

### Post-Session Reflection
- Mood check-in after the session ends
- Surfaces mood delta: if mood after < mood before, gently notes it
- This feedback loop is the core long-term behaviour change mechanism

### Analytics Dashboard
- Attempts by hour of day (highlights late-night spike patterns)
- Allow / Reflect / Redirect breakdown over time
- Most-attempted apps
- Mindful days streak (days with zero unintentional opens)
- Full session history with reason and decision logged

### Privacy-First Design
- All data stored in localStorage — nothing leaves the device
- No user accounts, no tracking, no server-side storage of personal data
- Only the LLM evaluation call (reason + mood + anonymous usage stats) touches a server

---

## Technical Architecture

```
┌─────────────────────────────────┐
│         Next.js Frontend        │
│                                 │
│  Phone mockup simulation        │
│  ConscienceLayer state machine  │
│  Analytics dashboard (Recharts) │
│  localStorage session store     │
└──────────────┬──────────────────┘
               │ POST /api/evaluate
               │ (mood, reason, history)
┌──────────────▼──────────────────┐
│         FastAPI Backend         │
│                                 │
│  Structured prompt engineering  │
│  JSON response parsing          │
│  Decision: allow/reflect/redirect│
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Claude claude-sonnet-4-6   │
│                                 │
│  Compassionate, non-judgmental  │
│  Contextually aware responses   │
│  Structured JSON output         │
└─────────────────────────────────┘
```

**Stack:**
- Frontend: Next.js 16, Tailwind CSS, Recharts
- Backend: Python FastAPI
- AI: Anthropic Claude (`claude-sonnet-4-6`)
- Storage: localStorage (no external database)

---

## Ethical Design

### Three core questions answered

**1. Who benefits, and who might be harmed?**

Benefits: users who want to change their relationship with their phone. The tool is opt-in, always transparent about what it's doing and why.

Potential harm: a user in crisis reaching for their phone for genuine support (e.g. contacting a friend during a mental health emergency) could be slowed down. Mitigation: the emergency override is always visible and one tap away. MindGate is not a safety tool and does not position itself as one.

**2. What could go wrong?**

| Risk | Mitigation |
|---|---|
| AI gives harmful advice | LLM prompt explicitly forbids prescriptive advice; always frames as observation not instruction |
| Becomes a shame spiral | Every response is compassionate in tone; never uses words like "addiction", "fail", "wrong" |
| Privacy violation | No server-side data storage; reason/mood data never persists beyond the LLM call |
| False sense of control | Transparency: MindGate tells users what it observed and why it made its decision |

**3. Does it empower people or make decisions for them?**

MindGate never makes a hard decision. It can reflect and redirect, but it cannot block. The user always has the final say. The goal is not compliance — it's **informed choice**. The AI provides context the user doesn't have in the moment (their mood, the time, how many times they've tried today). What they do with that context is entirely up to them.

---

## Impact Potential

### Immediate (hackathon demo)
- Demonstrates the full conscience layer flow end-to-end
- Shows real AI evaluation adapting to different moods and reasons
- Analytics dashboard shows what behaviour change tracking looks like over time

### Near-term (3–6 months)
- Browser extension that intercepts real social media sites (no simulation)
- Mobile app with OS-level integration (Screen Time API on iOS, Digital Wellbeing API on Android)
- Weekly insight digest: "Here's your week in social media. Here's what your best days looked like."

### Long-term
- Therapist dashboard: clinicians can use anonymised MindGate session data as a starting point for conversations about phone use — with patient consent
- Research partnerships: the mood-before / mood-after delta across thousands of sessions would be genuinely novel data on how social media affects emotional state in real time
- Integration with existing mental health apps (Woebot, Headspace, etc.) as a behavioural layer

### Scale
- 2.5 billion social media users globally
- No distribution cost once built as a browser extension
- No recurring cost to users (API call per evaluation is fractions of a cent)
- Particularly high-impact in markets where mental health services are inaccessible or stigmatised

---

## What Makes This Different

| | Hard blockers | Screen Time | MindGate |
|---|---|---|---|
| Stops mindless use | ✓ (but gets disabled) | ✓ (but gets disabled) | ✓ (friction without blocking) |
| Respects autonomy | ✗ | ✗ | ✓ |
| Builds self-awareness | ✗ | ✗ | ✓ |
| Adapts to context | ✗ | ✗ | ✓ |
| Shows behaviour patterns | ✗ | Partial | ✓ |
| Works with legitimate use | ✗ | Partial | ✓ |
| Emergency access | ✗ | ✓ | ✓ |

The key insight: **the goal is not to stop people using social media. It is to make every open a choice rather than a reflex.** That's a fundamentally different design philosophy — and it's the only one that can actually work long-term.

---

## Team & Track

**Track:** Neuroscience & Mental Health
**Hackathon:** Claude Builder Club
**Powered by:** Anthropic Claude (`claude-sonnet-4-6`)
