# Android Management System (AMS)

A focused Android app control center for tracking ideas, active builds, and published apps without unnecessary dashboard clutter.

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

## Product structure

The app is intentionally tight and centered on the core workflow:

- Dashboard
- Apps List
- Add / Edit App
- App Detail
- Idea Vault
- Settings

## Core features

- CRUD for apps: create, list, edit, and delete.
- Dashboard stats for total apps, Play Store apps, personal apps, and ideas not started yet.
- Search plus filters for status, type, tags, and custom categories.
- Recent apps list for quick access.
- Idea Vault for rough concepts before converting them into full app records.
- Minimal settings page with profile and default template placeholders.

## Data model

### `apps`

Suggested columns in Supabase:

- `id` uuid primary key default `gen_random_uuid()`
- `name` text not null
- `type` text not null
- `status` text not null
- `category` text not null
- `description` text
- `links` jsonb default `'{}'::jsonb`
- `notes` text
- `tags` text[] default `'{}'`
- `created_at` timestamp with time zone default `now()`
- `updated_at` timestamp with time zone default `now()`

### `ideas`

Suggested columns in Supabase:

- `id` uuid primary key default `gen_random_uuid()`
- `title` text not null
- `description` text
- `category` text
- `tags` text[] default `'{}'`
- `created_at` timestamp with time zone default `now()`

## API endpoints

- `GET /api/health`
- `GET /api/apps`
- `GET /api/apps/:id`
- `POST /api/apps`
- `PUT /api/apps/:id`
- `DELETE /api/apps/:id`
- `GET /api/ideas`
- `POST /api/ideas`
- `DELETE /api/ideas/:id`
- `POST /api/ideas/:id/convert`

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

## Vercel notes

- Deploy the React frontend as a Vite application.
- Deploy the Express backend separately, or convert the routes into Vercel serverless functions.
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables.
- The local fallback mode is useful for UI development before Supabase tables exist.

## Next ideas

- Add authentication with Supabase Auth.
- Add drag-and-drop Kanban views.
- Add tags, deadlines, and competitor research links.
- Add analytics for idea validation and launch readiness.
