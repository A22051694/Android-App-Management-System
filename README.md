# Android Management System (AMS)

A starter full-stack dashboard for managing lots of Android app ideas in one place.

## Stack

- **Backend/runtime:** Node.js + Express
- **Frontend/dashboard:** React + Vite
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Project structure

```text
.
├── backend/   # Express API for app ideas
├── frontend/  # React dashboard
└── .env.example
```

## Features

- Dashboard for tracking app ideas, priorities, and pipeline stages.
- Quick capture form for new Android app ideas.
- Supabase-ready API with in-memory fallback for local development.
- Tailwind-powered interface with responsive stat cards and table views.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Add your Supabase project URL and service role key in `.env`.
4. Start both apps:
   ```bash
   npm run dev
   ```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Supabase schema

Create an `apps` table in Supabase with columns similar to:

- `id` uuid primary key default `gen_random_uuid()`
- `name` text not null
- `platform` text not null default `'Android'`
- `status` text not null
- `category` text not null
- `priority` text not null
- `owner` text not null
- `summary` text not null
- `created_at` timestamp with time zone default `now()`

## Vercel deployment notes

- Deploy the React frontend as a Vite application.
- Deploy the Node backend as a separate service or adapt `backend/src/server.js` into Vercel serverless functions.
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Vercel environment variables.

## Next ideas

- Add authentication with Supabase Auth.
- Add drag-and-drop Kanban views.
- Add tags, deadlines, and competitor research links.
- Add analytics for idea validation and launch readiness.
