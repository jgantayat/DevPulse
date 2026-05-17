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
│   ├── interceptors/   # auth-interceptors.ts, logging-interceptor.ts, global-error-interceptor.ts
│   ├── models/         # post.ts, user.ts, todo.ts (Post/PostPayload, User/UserApiResponse, Todo/DashboardData)
│   └── services/       # postservice.ts, userservice.ts, dashboard.ts, todo.ts
├── shared/
│   └── components/     # error-banner/, loading-spinner/ — scaffolded, not yet wired to real state
├── features/
│   ├── posts/          # Days 1–2: PostList + PostForm — CRUD via json-server (complete)
│   ├── users/          # Day 3: UserList — map + catchError pipeline (complete)
│   ├── search/         # Day 4: UserSearch — switchMap + debounceTime (complete)
│   ├── dashboard/      # Day 5: Dashboard — forkJoin parallel calls + mergeMap per-user posts (complete)
│   └── github/         # Day 9: GitHub REST API + pagination (not yet built)
└── layout/             # Shell with sidebar + header (not yet built)
```

### Data sources

| Source | URL | Used for |
|---|---|---|
| `json-server` | `http://localhost:3000` | posts (CRUD), users (10), todos (10) |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | users + todos (read-only) |
| GitHub REST API | `https://api.github.com` | repo search + pagination (Day 9) |

API base URLs live in `src/environments/environment.development.ts` as `apiUrl`, `jsonPlaceholderUrl`, `githubApiUrl`. Both `environment.ts` and `environment.development.ts` exist; always import from `environment` (not `environment.development`) and let the Angular CLI swap files via `fileReplacements` in `angular.json`.

### Routing

`app.routes.ts` — default redirect goes to `posts`. Lazy loading via `loadComponent` is already in use for `dashboard` and `users`; `posts` and `search` are eager.

### Key Angular patterns used in this project

- **Naming**: Angular 17+ style — no `Component` suffix on class names (`PostList` not `PostListComponent`); files use no `.component.ts` suffix (`post-list.ts`). Services are named without a hyphen (`postservice.ts`, `userservice.ts`).
- **Dependency injection**: use `inject()` function, not constructor injection
- **HTTP**: `provideHttpClient(withFetch())` in `app.config.ts` — `withFetch()` is required for SSR compatibility; services return `Observable<T>`, never converted to Promises
- **Models**: use a separate `*Payload` interface (e.g. `PostPayload`) for create/update requests that omit `id`; use a dual-model pattern for external APIs (`UserApiResponse` → trimmed `User`) with the mapping done in the service layer
- **Templates**: prefer `async pipe` over manual `.subscribe()` to avoid memory leaks
- **Reactivity**: Angular Signals (`signal()`, `computed()`) introduced in Day 8 alongside `BehaviorSubject`
- **Subscription cleanup**: `takeUntilDestroyed()` — already in use in `PostForm`; standard for all new subscriptions

### HTTP Interceptors (Day 7 — scaffolded, not yet activated)

Three functional interceptors exist in `src/app/core/interceptors/`:

| File | Export | Purpose |
|---|---|---|
| `auth-interceptors.ts` | `authInterceptor` | Adds `Authorization: Bearer <token>` header to `localhost:3000` requests only |
| `logging-interceptor.ts` | `loggingInterceptor` | Logs request start, response status, and duration using a random request ID |
| `global-error-interceptor.ts` | `errorInterceptor` | Handles 401 and network errors (status 0) globally via `catchError` |

Intended registration order in `withInterceptors([loggingInterceptor, authInterceptor, errorInterceptor])` — logging wraps the entire chain; auth adds headers on the way out; error catches on the way back. The `withInterceptors([...])` call is currently commented out in `app.config.ts` and needs to be uncommented to activate them.

### Known issues

- **`src/app/core/services/todo.ts`**: The `todoApiUrl` template literal has a mixed quote (`';\`` at the end) — causes a runtime URL error. Also, `HttpClient` is assigned to a property named `HttpClient` (should be camelCase `httpClient`).
- **Environment imports**: Some services still import `environment.development` directly. Change these to import from `environment`.
- **`app.routes.ts`**: The `DashboardComponent` export name in the lazy-loaded dashboard route does not match the actual class name — verify the export name in `dashboard.ts` before wiring up.

### SSR note

The project was scaffolded with SSR enabled (`outputMode: "server"`). The Express server entry is `src/server.ts`. During the early learning days (1–8), SSR is incidental — features are developed as client-side components.

## TypeScript config

Strict mode is fully enabled including `strictTemplates`, `noImplicitReturns`, and `noPropertyAccessFromIndexSignature`. All new code must satisfy these without suppression.
