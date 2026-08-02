# HabitCoach — AI Financial Habit Coach

Track expenses, set savings goals, and get personalized coaching through natural conversation.

## Features

- **AI expense logging** — type naturally (e.g. “Spent ₹350 on tea”) and confirm before saving
- **AI coach chat** — ask about spending, log expenses, or create goals via tools
- **Dashboard** — today’s total, 7-day chart, recent transactions, and goal progress
- **Goals** — create targets, add funds, and track completion
- **Settings** — profile name and preferred currency

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth + Postgres)
- Groq (`llama-3.3-70b-versatile`) for AI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

3. Apply the SQL in `supabase/` to your Supabase project (tables, RLS, triggers).

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy

Deploy on [Vercel](https://vercel.com) and set the same environment variables in the project settings.
