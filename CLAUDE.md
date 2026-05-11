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

### Folder structure

```
src/app/
├── core/
│   ├── models/         # TypeScript interfaces: Post, PostPayload, User, UserApiResponse
│   ├── services/       # All HttpClient services (postservice.ts, userservice.ts)
│   └── interceptors/   # Auth + logging HTTP interceptors (Day 7, not yet built)
├── shared/
│   └── components/     # LoadingSpinner, ErrorBanner (scaffolded, not yet wired up)
├── features/
│   ├── posts/          # Days 1–2: CRUD via json-server — PostList + PostForm
│   ├── users/          # Day 3: map + catchError — UserList (scaffold)
│   ├── search/         # Day 4: switchMap + debounceTime (planned)
│   ├── dashboard/      # Day 5: forkJoin parallel calls (planned)
│   └── github/         # Day 9: GitHub REST API + pagination (planned)
└── layout/             # Shell with sidebar + header (planned)
```

### Data sources

| Source | URL | Used for |
|---|---|---|
| `json-server` | `http://localhost:3000` | posts (14), users (10), todos (10) CRUD |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | read-only fallback data |
| GitHub REST API | `https://api.github.com` | repo search + pagination (Day 9) |

API base URLs live in `src/environments/environment.development.ts` as `apiUrl`, `jsonPlaceholderUrl`, `githubApiUrl`. **Note**: services currently import `environment.development` directly — the convention to follow is importing from `environment` (Angular CLI swaps the file at build time).

### Key Angular patterns used in this project

- **Naming**: Angular 17+ style — no `Component` suffix on class names (`PostList` not `PostListComponent`); files use no `.component.ts` suffix (`post-list.ts`, `postservice.ts`)
- **Dependency injection**: use `inject()` function, not constructor injection
- **HTTP**: `provideHttpClient(withFetch())` in `app.config.ts` — `withFetch()` is required for SSR compatibility; services return `Observable<T>`, never converted to Promises
- **Models**: use a separate `*Payload` interface (e.g. `PostPayload`) for create/update requests that omit `id`; use a dual-model pattern for external APIs (`UserApiResponse` → trimmed `User`) with the mapping done in the service layer
- **Templates**: prefer `async pipe` over manual `.subscribe()` to avoid memory leaks
- **Reactivity**: Angular Signals (`signal()`, `computed()`) introduced in Day 8 alongside `BehaviorSubject`
- **Routing**: eagerly loaded today; plan is to move to lazy-loaded routes via `loadComponent` as features grow
- **Subscription cleanup**: `takeUntilDestroyed()` operator (Day 6+) instead of manual unsubscribe

### SSR note

The project was scaffolded with SSR enabled (`outputMode: "server"`). The Express server entry is `src/server.ts`. During the early learning days (1–8), SSR is incidental — features are developed as client-side components.

## TypeScript config

Strict mode is fully enabled including `strictTemplates`, `noImplicitReturns`, and `noPropertyAccessFromIndexSignature`. All new code must satisfy these without suppression.
