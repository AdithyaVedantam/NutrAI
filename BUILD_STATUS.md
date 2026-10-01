# NutrAI – Build Status (updated)

## Stack
Next.js 14 + React + TS + Tailwind (frontend, :3000) → Express + TS (backend, :4000) → PostgreSQL (Neon) via Prisma.
LLM: **Google Gemini** (Google AI Studio key) via plain `fetch` in `backend/services/llm.ts`.

## Folder structure
```
NutrAI/
├── BUILD_STATUS.md  README.md  .gitignore
├── backend/
│   ├── server.ts  package.json  tsconfig.json  .env  .env.example
│   ├── routes/      auth  profile  meals  ai  dietPlans  foods
│   ├── services/    llm (Gemini + prompts + zod validation)  nutrition (BMR/macros)
│   ├── middleware/  auth (JWT)
│   ├── lib/         prisma  asyncHandler
│   ├── data/        foods (small local food dataset, ~28 items)
│   └── prisma/      schema.prisma
└── frontend/
    ├── package.json  tsconfig.json  next/tailwind/postcss configs  .env.local
    ├── app/  layout  page(landing)  globals.css  login/  signup/  onboarding/
    │         └── (app)/  layout + dashboard  meals  analyzer  assistant  diet-plan  profile
    ├── components/  AuthForm MealCard MealForm ProfileForm ProgressBar Ring Sidebar
    ├── lib/         api  auth.tsx  dates
    └── types/       index.ts
```

## Env vars (backend/.env)
DATABASE_URL, JWT_SECRET, LLM_API_KEY (Google AI Studio), LLM_MODEL=gemini-3.8-flash, FRONTEND_URL, PORT.
Frontend: NEXT_PUBLIC_API_URL=http://localhost:4000 (frontend/.env.local).

## Run
```
cd backend  && npm install && npx prisma db push && npm run dev
cd frontend && npm install && npm run dev
```

## Checklist
### Done
- [x] Project setup, folder structure, .gitignore, .env.example
- [x] UI foundation (Tailwind components, sidebar, mobile bottom bar)
- [x] Signup / login (bcrypt + JWT), protected routes
- [x] Onboarding + profile, deterministic BMR/macro targets (Mifflin-St Jeor)
- [x] Dashboard (calorie ring, macro bars, today's meals, 7-day chart)
- [x] Meals: add / edit / delete, day navigation
- [x] Neon PostgreSQL + Prisma connected, `db push` works
- [x] AI Analyzer, Assistant, Diet Plan code (now switched to Gemini)
- [x] Meal form auto-fill: pick a common food × servings, or "✨ Estimate" with AI (no need to know macros)
- [x] Backend + frontend typecheck clean

### To verify on your machine (needs your Gemini key)
- [ ] Analyzer: "2 paneer parathas with curd and a banana" → estimate → Add to Today's Meals
- [ ] Assistant replies using today's intake
- [ ] Diet Plan generates and saves
- [ ] Meals page: quick-fill from food list + AI estimate

### Left
- [ ] Rotate leaked secrets (Gemini key, JWT secret) – see below
- [ ] `cd frontend && npm install next@14` (security patch)
- [ ] Push to GitHub (check `git status` – `.env` must not be listed)
- [ ] Optional deploy: Render (backend, root `backend`) + Vercel (frontend, root `frontend`)
- [ ] Optional polish: mobile check, empty/error states review

## Known notes
- Gemini free tier has rate limits (HTTP 429 → friendly message shown).
- Neon free DB sleeps when idle; first request after a pause can be slow or fail once (P1001) – retry.

## For Antigravity
Read this file. Run typecheck in both folders, fix errors without adding features/libraries, start both servers,
test signup → onboarding → dashboard → add meal (quick-fill + AI estimate) → analyzer → assistant → diet plan. Update this file.


## Update 4
- [x] Light/dark mode (ThemeToggle, CSS-variable slate palette, saved in localStorage)
- [x] Model fallback chain in backend/services/llm.ts (LLM_MODELS env optional)
- [ ] GitHub push + public deploy (Render + Vercel)
