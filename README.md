# DevPulse Dashboard

A 10-day Angular learning project focused on `HttpClient`, RxJS operators, and Angular Signals. Built with Angular 21 standalone components — no `NgModule`, no UI library, no custom backend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals) |
| HTTP | Angular `HttpClient` |
| Reactivity | RxJS operators + Angular Signals |
| Mock Backend | `json-server` (local REST from `db.json`) |
| Real APIs | JSONPlaceholder, GitHub REST API v3 |
| Forms | Reactive Forms |
| Testing | Vitest (via Angular CLI) |
| SSR | `@angular/ssr` + Express |

## Getting Started

**Terminal 1 — mock backend:**
```bash
json-server --watch db.json --port 3000
```

**Terminal 2 — dev server:**
```bash
npm start
```

Open `http://localhost:4200`.

## Commands

```bash
npm start          # dev server (http://localhost:4200)
npm run build      # production build → dist/
npm test           # run unit tests with Vitest
```

## 10-Day Roadmap

| Day | Topic |
|-----|-------|
| 01 | Project setup + first HTTP GET |
| 02 | CRUD operations + typed responses |
| 03 | `map`, `tap`, `filter`, `catchError` |
| 04 | `switchMap` + `debounceTime` (live search) |
| 05 | `forkJoin` + `mergeMap` (parallel calls) |
| 06 | `exhaustMap` + `takeUntilDestroyed` |
| 07 | HTTP interceptors (auth + logging) |
| 08 | Signals + `BehaviorSubject` state |
| 09 | Real GitHub API + pagination |
| 10 | Lazy loading + deploy |

Per-day guides with code, concepts, and checkpoints are in `devpulse-plan/days/`.

## Data Sources

| Source | URL | Used for |
|---|---|---|
| `json-server` | `http://localhost:3000` | posts, users, todos CRUD (Days 1–8) |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | read-only fallback data |
| GitHub REST API | `https://api.github.com` | repo search + pagination (Day 9) |

API base URLs are configured in `src/environments/environment.ts`.

## Project Structure

```
src/app/
├── core/
│   ├── models/         # TypeScript interfaces (Post, User, Todo, Repo)
│   ├── services/       # HttpClient services
│   └── interceptors/   # Auth + logging interceptors
├── shared/
│   └── components/     # LoadingSpinner, ErrorBanner, EmptyState
├── features/
│   ├── posts/          # Days 1–2: CRUD
│   ├── users/          # Day 3: map + catchError
│   ├── search/         # Day 4: switchMap + debounce
│   ├── dashboard/      # Day 5: forkJoin
│   └── github/         # Day 9: GitHub API + pagination
└── layout/             # Shell (sidebar + header)
```

## Learning Log

Daily reflections are tracked in `devpulse-plan/LEARNING_LOG.md`.
