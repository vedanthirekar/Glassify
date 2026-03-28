# MindGate

Your AI conscience for mindful social media use.

## Quick Start

### 1. Backend

```bash
cd backend
# Add your key:
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Run:
uvicorn main:app --reload
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

## Demo Flow

1. Open http://localhost:3000
2. Click any social media icon (Instagram, TikTok, X, etc.)
3. Select your mood
4. Type why you want to open the app
5. MindGate evaluates and responds
6. If allowed → countdown timer starts
7. After session → mood check-in
8. Switch to "My Patterns" tab to see analytics

## Architecture

- **Frontend**: Next.js 16 + Tailwind CSS (phone mockup simulation)
- **Backend**: FastAPI + Anthropic Claude API
- **Storage**: localStorage (no external DB needed)
