# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

DevPulse is a 10-day Angular learning project focused on `HttpClient`, RxJS operators, and Angular Signals. It is **not** a production app — the goal is to practice specific patterns each day. The plan lives in `devpulse-plan/` and includes day-by-day guides.

## Commands

```bash
# Dev server (http://localhost:4200)
npm start

# Mock backend — must run alongside dev server
json-server --watch db.json --port 3000

# Build
npm run build

# Tests (Vitest via Angular CLI)
npm test

# Run a single test file
npx ng test --include="**/post.service.spec.ts"

# SSR production server (after build)
npm run serve:ssr:DevPulse
```

## Architecture

**Angular 21 standalone app with SSR enabled** (Express + `@angular/ssr`). Every component and directive uses standalone APIs — no `NgModule`.

### Planned folder structure (from `devpulse-plan/README.md`)

```
src/app/
├── core/
│   ├── models/         # TypeScript interfaces: Post, User, Todo, Repo
│   ├── services/       # All HttpClient services
│   └── interceptors/   # Auth + logging HTTP interceptors (Day 7)
├── shared/
│   └── components/     # LoadingSpinner, ErrorBanner, EmptyState
├── features/
│   ├── posts/          # Days 1–2: CRUD via json-server
│   ├── users/          # Day 3: map + catchError
│   ├── search/         # Day 4: switchMap + debounceTime
│   ├── dashboard/      # Day 5: forkJoin parallel calls
│   └── github/         # Day 9: GitHub REST API + pagination
└── layout/             # Shell with sidebar + header
```

### Data sources

| Source | URL | Used for |
|---|---|---|
| `json-server` | `http://localhost:3000` | posts, users, todos CRUD |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | read-only fallback data |
| GitHub REST API | `https://api.github.com` | repo search + pagination (Day 9) |

API base URLs go in `src/environments/environment.ts` as `apiUrl`, `jsonPlaceholderUrl`, `githubApiUrl`.

### Key Angular patterns used in this project

- **Dependency injection**: use `inject()` function, not constructor injection
- **HTTP**: `provideHttpClient()` in `app.config.ts`; services return `Observable<T>`, never converted to Promises
- **Templates**: prefer `async pipe` over manual `.subscribe()` to avoid memory leaks
- **Reactivity**: Angular Signals (`signal()`, `computed()`) introduced in Day 8 alongside `BehaviorSubject`
- **Routing**: all feature routes are lazy-loaded via `loadComponent`
- **Subscription cleanup**: `takeUntilDestroyed()` operator (Day 6+) instead of manual unsubscribe

### SSR note

The project was scaffolded with SSR enabled (`outputMode: "server"`). The Express server entry is `src/server.ts`. During the early learning days (1–8), SSR is incidental — features are developed as client-side components.

## TypeScript config

Strict mode is fully enabled including `strictTemplates`, `noImplicitReturns`, and `noPropertyAccessFromIndexSignature`. All new code must satisfy these without suppression.
