# Mission Control

A Linear-inspired dashboard for project, task, and automation tracking — built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and `@hello-pangea/dnd`. All state persists in `localStorage`.

## Screens

- **Overview** (`/`) — greeting, stats, recent activity, upcoming due dates, project snapshot, quick-add task
- **Task Board** (`/board`) — Kanban with drag-and-drop across Backlog / In Progress / In Review / Done, inline title editing, detail modal with description, assignee, priority, due date, project, notes
- **Calendar** (`/calendar`) — month grid with projected cron occurrences, side panel for cron jobs, add/edit/pause/delete
- **Projects** (`/projects`, `/projects/[id]`) — project cards with progress, drill-down with progress slider, milestones, notes, linked tasks

## Stack

- Next.js 14 (App Router) · TypeScript
- Tailwind CSS · `lucide-react` icons · Inter
- `@hello-pangea/dnd` for drag-and-drop
- `localStorage` for state (`mc.tasks.v1`, `mc.crons.v1`, `mc.projects.v1`)

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy

Push to GitHub, then import the repo on Vercel — no env vars required.

## Data model

See [`lib/types.ts`](./lib/types.ts) for `Task`, `CronJob`, and `Project` shapes. Seed data lives in [`lib/seed.ts`](./lib/seed.ts).

## Reset state

Open DevTools → Application → Local Storage → clear keys starting with `mc.`, then refresh.
