# HabitCoach

Expense tracking and savings goals in one place.

## Setup

```bash
npm install
```

Add a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

Apply the SQL in `supabase/`, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — lint
