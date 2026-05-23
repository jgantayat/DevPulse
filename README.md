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

| Day | Topic | Status |
|-----|-------|--------|
| 01 | Project setup + first HTTP GET | ✅ Done |
| 02 | CRUD operations + typed responses | ✅ Done |
| 03 | `map`, `tap`, `filter`, `catchError` | ✅ Done |
| 04 | `switchMap` + `debounceTime` (live search) | ✅ Done |
| 05 | `forkJoin` + `mergeMap` (parallel calls) | ✅ Done |
| 06 | `exhaustMap` + `takeUntilDestroyed` | ✅ Done |
| 07 | HTTP interceptors (auth + logging) | ✅ Done |
| 08 | Signals + `BehaviorSubject` state | ✅ Done |
| 09 | Real GitHub API + pagination | 🔲 Pending |
| 10 | Lazy loading + deploy | 🔲 Pending |

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
│   ├── models/         # Post, PostPayload, User, UserApiResponse, Todo, DashboardData
│   ├── services/       # postservice, userservice, dashboard, todo
│   └── interceptors/   # auth, logging, global-error interceptors ✅
├── shared/
│   └── components/     # error-banner, loading-spinner (scaffolded, not yet wired)
├── features/
│   ├── posts/          # Days 1–2: PostList + PostForm — full CRUD ✅
│   ├── users/          # Day 3: UserList — map + catchError ✅
│   ├── search/         # Day 4: UserSearch — switchMap + debounceTime ✅
│   ├── dashboard/      # Day 5: Dashboard — forkJoin + mergeMap ✅
│   └── github/         # Day 9: GitHub API + pagination (not yet built)
└── layout/             # Shell with sidebar + header (not yet built)
```

## Implementation Summary

### Day 01 — Project Setup + First HTTP GET
- Scaffolded Angular 21 standalone app with SSR, `json-server` mock backend, and environment files
- Created `Post` model and `PostService` with `getAllPosts()` returning `Observable<Post[]>`
- `PostList` component fetches and renders posts using the `async` pipe — no manual `.subscribe()`
- **Concepts:** `HttpClient`, `provideHttpClient(withFetch())`, `Observable<T>`, `async` pipe

### Day 02 — CRUD Operations + Typed Responses
- Extended `PostService` with `createPost()`, `updatePost()`, `deletePost()` using typed payloads
- Introduced `PostPayload` interface (omits `id`) for create/update requests
- Built `PostForm` component with Reactive Forms; `HttpHeaders` set for mutation requests
- **Concepts:** `HttpClient` POST/PUT/DELETE, `PostPayload` pattern, `ReactiveFormsModule`, `HttpHeaders`

### Day 03 — `map`, `tap`, `filter`, `catchError`
- Created `UserApiResponse` → `User` dual-model pattern; shape trimming done in the service layer
- `Userservice.getUsers()` pipeline: `tap` (debug log) → `map` (trim nested fields) → `filter` (skip empty) → `catchError` (return `of([])`)
- `UserList` component with lazy-loaded route; displays trimmed user data via `async` pipe
- **Concepts:** `map`, `tap`, `filter`, `catchError`, `of()`, dual-model API response mapping

### Day 04 — `switchMap` + `debounceTime` (Live Search)
- `UserSearch` component drives search via a `FormControl` value-changes stream
- Pipeline: `startWith('')` → `debounceTime(300)` → `distinctUntilChanged` → `switchMap` → `catchError`
- `switchMap` cancels any in-flight request when a new keystroke arrives — only the latest query survives
- **Concepts:** `switchMap`, `debounceTime`, `distinctUntilChanged`, `startWith`, `FormControl`

### Day 05 — `forkJoin` + `mergeMap` (Parallel Calls)
- `Dashboard` service fires three HTTP calls simultaneously with `forkJoin({posts, users, todos})`
- `map` derives `DashboardData` (totals + completed/pending counts) from the combined result
- `getUsersWithPostCount()` uses `mergeMap` to fan out a per-user post-count fetch for all users concurrently
- **Concepts:** `forkJoin`, `mergeMap`, parallel HTTP, result combining with `map`

### Day 06 — `exhaustMap` + `takeUntilDestroyed`
- `PostForm` submit flow refactored around a `Subject<PostPayload>` trigger
- `exhaustMap` wraps the create/update HTTP call — while a request is in flight, further submit clicks are silently ignored, preventing duplicate POSTs
- `takeUntilDestroyed()` added to the submit subscription and to the delete subscription in `PostList`
- **Concepts:** `exhaustMap`, `Subject`, `takeUntilDestroyed`, `DestroyRef`

### Day 07 — HTTP Interceptors (Auth + Logging)
- **`authInterceptor`** — reads a token from `localStorage`, clones the request with `req.clone()` to add `Authorization: Bearer <token>`, applied only to `localhost:3000` (public APIs pass through unchanged)
- **`loggingInterceptor`** — generates a random request ID, logs `▶ METHOD URL` on send and `✓ STATUS (Nms)` on response via `tap()` on the `HttpEvent` stream; uses `HttpResponse` type guard to skip non-final events
- **`errorInterceptor`** — `catchError` handler for 401 (token expiry warning) and status 0 (network unreachable); rethrows so individual services can still handle errors locally
- All three imported in `app.config.ts`; `withInterceptors([loggingInterceptor, authInterceptor, errorInterceptor])` is ready to uncomment
- **Concepts:** `HttpInterceptorFn`, `req.clone()`, `withInterceptors`, `tap` on response stream, `HttpResponse` type guard, `catchError`, `HttpErrorResponse`, interceptor chain order

### Day 08 — Signals + State Management
- `PostService` migrated from Observable-only to signal-based state: private writable signals `_posts`, `_isLoading`, `_error` exposed as read-only via `.asReadonly()`
- `computed()` derives `postCount`, `hasPosts`, and `myPosts` (filtered to `userId === 1`) from the posts signal — no extra subscriptions needed
- `effect()` in the constructor logs post count and loading state whenever either signal changes — reactive side-effect without a subscription
- `getAllPosts()` changed to `void` return; it drives the signal update pipeline directly (`.set()` on next, `.set()` on error)
- Mutation methods (`createPost`, `updatePost`, `deletePost`) still return `Observable<T>` but use `tap()` to call `_posts.update()` — single source of truth updated in the service, not the component
- `PostList` reads `postService.posts`, `postService.isLoading`, and `postService.error` directly as signals — no `async` pipe or manual subscribe needed for list rendering
- **Concepts:** `signal()`, `computed()`, `effect()`, `.asReadonly()`, `.update()`, `.set()`, mixing Signals with RxJS `tap()`

## Learning Log

Daily learning reflections live in `devpulse-plan/LEARNING_LOG.md`.
