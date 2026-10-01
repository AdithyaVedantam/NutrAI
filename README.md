# NutrAI - AI-powered nutrition & meal planning

A full-stack web app where you set a goal, log meals (manually or by describing them in plain English), and see calories and macros against personalised daily targets. An AI assistant and diet-plan generator use your profile and today's intake as context.

<!-- Add 2-3 screenshots here: dashboard, AI analyzer, assistant (dark mode too) -->

## Features
- Sign up / log in (passwords hashed with bcrypt, JWT sessions)
- Onboarding: age, sex, height, weight, activity, goal, diet
- Daily calorie + macro targets (Mifflin-St Jeor, plain code - the AI is not used here)
- Dashboard: calorie ring, macro bars, today's meals, 7-day history
- Meals: add / edit / delete, browse by day
- AI meal analyzer: "2 paneer parathas with curd and a banana" -> validated nutrition estimate + assumptions -> add to log
- AI nutrition assistant: chat that knows your goal, targets and intake so far
- AI diet-plan generator, saved per user
- Light / dark mode, responsive layout

## Tech stack
Next.js 14, React, TypeScript, Tailwind CSS | Node.js, Express, TypeScript, Zod | PostgreSQL + Prisma | Google Gemini API (automatic fallback across several models)

## How it works
Next.js frontend -> Express REST API -> PostgreSQL (Prisma). For AI: frontend -> Express -> Gemini -> JSON -> validated with Zod -> frontend. The API key lives only in `backend/.env`; the browser never sees it.

## Run locally
1. Copy `backend/.env.example` to `backend/.env` and fill in `DATABASE_URL` (e.g. a free Neon Postgres), `JWT_SECRET` (long random string) and `LLM_API_KEY` (Gemini key from aistudio.google.com/apikey).
2. Backend: `cd backend && npm install && npx prisma db push && npm run dev` (port 4000)
3. Frontend: `cd frontend && npm install && npm run dev` (port 3000)

## Project structure
```
backend/   server.ts, routes/, services/ (llm, nutrition), middleware/auth.ts, lib/, data/foods.ts, prisma/schema.prisma
frontend/  app/ (landing, auth, onboarding, dashboard, meals, analyzer, assistant, diet-plan, profile), components/, lib/, types/
```

## Notes
Nutrition values are estimates and AI output can be wrong; it is validated but not medical advice.
