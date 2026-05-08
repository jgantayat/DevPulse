# Day 10 — Lazy Loading + README + Deploy to GitHub Pages

## Goal
Make the app production-ready — add lazy-loaded routes for performance, write a thorough README and LEARNING_LOG, then deploy a live link to GitHub Pages. This is your portfolio artifact.

---

## Key Steps

- Audit all routes and convert to `loadComponent()` lazy loading
- Verify bundle splitting in build output (each route = separate chunk)
- Write `README.md` with features, tech, run instructions, and what you learned
- Write `LEARNING_LOG.md` — one entry per day, one paragraph each
- Configure `angular.json` `outputPath` and set `baseHref` for GitHub Pages
- Deploy using `angular-cli-ghpages` or Vercel (Vercel is easier)
- Final review: re-implement one pattern from memory without looking at notes

---

## Concepts to Explore

- `loadComponent(() => import(...).then(m => m.ComponentClass))` — lazy loads a standalone component
- Route-level code splitting — Angular CLI generates separate JS chunk per lazy route
- `ng build --configuration production` — enables tree-shaking, minification, optimization
- `baseHref` — the subfolder your app is served from on GitHub Pages (`/repo-name/`)
- `angular-cli-ghpages` — npm package that deploys `dist/` to `gh-pages` branch automatically
- Bundle size analysis — `ng build --stats-json` + `webpack-bundle-analyzer`
- `provideRouter(routes, withPreloading(PreloadAllModules))` — preload lazy chunks in background after initial load

---

## Files to Edit / Create

```
devpulse-dashboard/
├── src/app/
│   └── app.routes.ts         ← EDIT (all routes lazy)
├── README.md                 ← CREATE (project showcase)
├── LEARNING_LOG.md           ← CREATE (daily reflections)
└── angular.json              ← EDIT (outputPath for deploy)
```

---

## Code

### `src/app/app.routes.ts` — All routes lazy loaded

```typescript
import { Routes } from '@angular/router';
import { withPreloading, PreloadAllModules } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'Dashboard — DevPulse'
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./features/posts/post-list/post-list.component')
        .then(m => m.PostListComponent),
    title: 'Posts — DevPulse'
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/user-list/user-list.component')
        .then(m => m.UserListComponent),
    title: 'Users — DevPulse'
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/user-search/user-search.component')
        .then(m => m.UserSearchComponent),
    title: 'Search — DevPulse'
  },
  {
    path: 'github',
    loadComponent: () =>
      import('./features/github/repo-search/repo-search.component')
        .then(m => m.RepoSearchComponent),
    title: 'GitHub Repos — DevPulse'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

---

### `src/app/app.config.ts` — Add preloading strategy

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // After initial load, preload all lazy chunks in background
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(
      withInterceptors([loggingInterceptor, authInterceptor, errorInterceptor])
    )
  ]
};
```

---

### Deploy Commands

```bash
# Step 1: Build for production
ng build --configuration production --base-href /devpulse-dashboard/

# Step 2: Install deploy tool (once)
npm install -g angular-cli-ghpages

# Step 3: Deploy to GitHub Pages
npx angular-cli-ghpages --dir=dist/devpulse-dashboard/browser

# OR deploy to Vercel (easier — no baseHref config needed)
npm install -g vercel
vercel --prod
```

---

### `README.md` (template to fill out)

```markdown
# DevPulse Dashboard

> A 10-day Angular learning project focused on Backend API integration patterns,
> RxJS operators, HTTP interceptors, and Angular Signals.

🔗 **Live Demo:** [your-github-pages-link]

---

## What I Built

A multi-page Angular dashboard that integrates with:
- **json-server** (local mock REST API) for Posts CRUD
- **JSONPlaceholder** (free public API) for Users and Live Search
- **GitHub REST API v3** for repository search with pagination

---

## Features

- ✅ Full CRUD with `HttpClient` (GET, POST, PUT, DELETE)
- ✅ RxJS operators: `map`, `tap`, `filter`, `catchError`, `switchMap`,
     `debounceTime`, `forkJoin`, `mergeMap`, `exhaustMap`
- ✅ Live search with `switchMap` + `debounceTime` (cancels stale requests)
- ✅ Parallel API calls with `forkJoin` on Dashboard page
- ✅ Form submit safety with `exhaustMap` (prevents double-submit)
- ✅ Memory leak prevention with `takeUntilDestroyed()`
- ✅ HTTP Interceptors: Auth token injection + request logging + global error handling
- ✅ Angular Signals for service-level state (`signal`, `computed`, `effect`)
- ✅ GitHub API with pagination and rate limit error handling
- ✅ Lazy-loaded routes with `PreloadAllModules` strategy

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Angular 21 (standalone components) |
| HTTP | Angular `HttpClient` |
| Reactivity | RxJS + Angular Signals |
| Mock API | json-server |
| Real APIs | JSONPlaceholder, GitHub REST API v3 |
| Forms | Reactive Forms |

---

## Run Locally

```bash
# Clone
git clone https://github.com/your-username/devpulse-dashboard.git
cd devpulse-dashboard

# Install
npm install

# Start mock backend
npm install -g json-server
json-server --watch db.json --port 3000

# Start Angular app (separate terminal)
ng serve

# Open
http://localhost:4200
```

---

## What I Learned

See [LEARNING_LOG.md](./LEARNING_LOG.md) for daily reflections.

Key takeaways:
- `switchMap` vs `mergeMap` vs `exhaustMap` — choosing the right flattening operator matters
- HTTP Interceptors are the cleanest place for auth tokens and global error handling
- Angular Signals + RxJS are complementary, not competing — use both
- `async pipe` should always be preferred over manual `.subscribe()` in templates
```

---

### `LEARNING_LOG.md` (template — fill in your own words each day)

```markdown
# Learning Log — DevPulse Dashboard

## Day 01 — Project Setup + First HTTP GET
Set up Angular with `provideHttpClient()` and connected to json-server.
Key insight: Observables are lazy — nothing happens until `.subscribe()` or `async pipe` is used.
The `async pipe` is almost always better than manual subscribe in templates.

## Day 02 — CRUD + Typed Responses
Learned how TypeScript interfaces act like Java DTOs for API responses.
Key insight: Use `async pipe` for read operations, manual `subscribe` only when you have side effects (navigate, reset form).

## Day 03 — map, tap, filter, catchError
The service layer is the right place for transformations — components should receive clean data.
Key insight: `catchError` with `of([])` keeps the Observable alive; without it, one error kills the entire stream.

## Day 04 — switchMap + debounce (Live Search)
The race condition with `mergeMap` finally clicked when I saw it in DevTools Network tab.
Key insight: `switchMap` cancels the previous Observable. This is essential for search.

## Day 05 — forkJoin + mergeMap
Key insight: `forkJoin` is for HTTP (completes once). `combineLatest` is for ongoing streams.
Partial failure protection — wrap each source with `catchError` before passing to `forkJoin`.

## Day 06 — exhaustMap + takeUntilDestroyed
Key insight: `exhaustMap` on form submit is the safest default — no double-submit bugs ever.
`takeUntilDestroyed()` in the constructor is the cleanest cleanup pattern in Angular 17+.

## Day 07 — HTTP Interceptors
Key insight: Interceptors are middleware. Auth tokens, logging, and error handling belong here — not in individual services.
The `req.clone()` immutability requirement was surprising but makes sense for the chain pattern.

## Day 08 — Signals + BehaviorSubject
Key insight: Signals are for component/UI state. BehaviorSubject is for when you need to pipe into RxJS operators.
They're not competing — `toSignal()` and `toObservable()` bridge the two worlds.

## Day 09 — Real GitHub API + Pagination
Key insight: CORS is a server problem, not Angular's. `status: 0` = CORS blocked or network down.
`HttpParams` builds query strings cleanly without manual string concatenation.

## Day 10 — Lazy Loading + Deploy
Key insight: Route-level code splitting means users only download code for pages they visit.
`PreloadAllModules` is the sweet spot — lazy initial load, then background preload.
```

---

## Final Checklist Before Merging to Main

```
□ All routes are lazy loaded (`loadComponent`)
□ All subscriptions use `async pipe` or `takeUntilDestroyed`
□ No hardcoded API URLs in services (all from `environment.ts`)
□ Error states handled on every page (not just happy path)
□ Loading states shown on every async operation
□ `ng build --configuration production` runs with zero errors
□ README.md written with live demo link
□ LEARNING_LOG.md has one entry per day
□ GitHub repo is public (for portfolio visibility)
□ All commits have meaningful messages (the commit history tells the story)
```

---

## Bundle Analysis (Optional but Impressive)

```bash
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/devpulse-dashboard/browser/stats.json
```

Screenshot the result and include it in your README — shows you care about performance.

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `loadComponent()` | All 5 feature routes |
| `PreloadAllModules` | `app.config.ts` router provider |
| `title` in routes | Each route has a page title |
| `ng build --configuration production` | Production bundle |
| `--base-href` flag | GitHub Pages subfolder config |
| `angular-cli-ghpages` | Deploy `dist/` to `gh-pages` branch |
| `LEARNING_LOG.md` | Daily reflection — interview goldmine |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "chore: lazy loading + PreloadAllModules + README + LEARNING_LOG + deploy"
```

> **Final Checkpoint:** Visit your live GitHub Pages link from a different device. Open DevTools → Network tab → navigate between pages. You should see separate JS chunk files loading per route (e.g., `chunk-XXXXX.js`) — proof that lazy loading is working.

---

## 🎉 You're Done — What You Built in 10 Days

| Day | What You Shipped |
|-----|-----------------|
| 1 | Angular setup + first HttpClient GET |
| 2 | Full CRUD + TypeScript interfaces |
| 3 | RxJS pipeline: map, tap, filter, catchError |
| 4 | Live search: switchMap + debounce |
| 5 | Dashboard: forkJoin parallel calls |
| 6 | Form safety: exhaustMap + memory leak fixes |
| 7 | HTTP Interceptors: auth + logging + errors |
| 8 | Signals state: computed + effect + BehaviorSubject |
| 9 | Real GitHub API + pagination + CORS |
| 10 | Lazy routing + README + live deploy |
```
