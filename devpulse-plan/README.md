# DevPulse Dashboard — Project Planning Context

Angular + HttpClient personal API integration learning project. 10-day plan, ~2–3 hrs/day.
No custom backend — uses `json-server` (local mock) + JSONPlaceholder + GitHub Public API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals) |
| HTTP | Angular `HttpClient` |
| Reactivity | RxJS operators + Angular Signals |
| Mock Backend | `json-server` (local REST from `db.json`) |
| Real APIs | JSONPlaceholder, GitHub REST API v3 |
| Forms | Reactive Forms |
| Styling | Angular default CSS (no UI lib — focus is API integration) |
| Routing | Lazy-loaded routes |

---

## Target Folder Structure

```
devpulse-dashboard/
├── src/app/
│   ├── core/
│   │   ├── models/             # TypeScript interfaces (Post, User, Todo, Repo)
│   │   ├── services/           # All HttpClient service files
│   │   └── interceptors/       # HTTP interceptors (auth, logging)
│   ├── shared/
│   │   ├── components/         # LoadingSpinner, ErrorBanner, EmptyState
│   │   └── pipes/              # Reusable pipes if any
│   ├── features/
│   │   ├── posts/              # Day 1–2: CRUD with json-server
│   │   ├── users/              # Day 3: map + catchError
│   │   ├── search/             # Day 4: switchMap + debounce
│   │   ├── dashboard/          # Day 5: forkJoin parallel calls
│   │   ├── github/             # Day 9: Real GitHub API + pagination
│   │   └── settings/           # (optional) theme/preferences
│   ├── layout/                 # Shell component (sidebar + header)
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── db.json                     # json-server mock database
├── LEARNING_LOG.md             # Daily reflection notes
└── src/environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 10-Day Roadmap Overview

| Day | Topic | Phase |
|-----|-------|-------|
| Day 01 | Project Setup + First HTTP GET | Setup |
| Day 02 | CRUD Operations + Typed Responses | Setup |
| Day 03 | map, tap, filter, catchError | RxJS |
| Day 04 | switchMap + debounceTime (Live Search) | RxJS |
| Day 05 | forkJoin + mergeMap (Parallel Calls) | RxJS |
| Day 06 | exhaustMap + takeUntilDestroyed | RxJS |
| Day 07 | HTTP Interceptors (Auth + Logging) | Patterns |
| Day 08 | Signals + BehaviorSubject State | Patterns |
| Day 09 | Real GitHub API + Pagination + CORS | Real World |
| Day 10 | Lazy Loading + README + Deploy | Polish |

---

## Setup Notes (Do This First)

```bash
# Scaffold the project
ng new devpulse-dashboard --style=css --routing=true --ssr=false

cd devpulse-dashboard

# Install json-server globally
npm install -g json-server

# Create mock database
touch db.json
```

Paste this into `db.json`:
```json
{
  "posts": [
    { "id": 1, "title": "First Post", "body": "Hello world", "userId": 1 },
    { "id": 2, "title": "Second Post", "body": "Another entry", "userId": 1 }
  ],
  "users": [
    { "id": 1, "name": "Jay Dev", "email": "jay@dev.com", "role": "admin" },
    { "id": 2, "name": "Test User", "email": "test@user.com", "role": "viewer" }
  ],
  "todos": [
    { "id": 1, "title": "Learn RxJS", "completed": false, "userId": 1 },
    { "id": 2, "title": "Build Dashboard", "completed": true, "userId": 1 }
  ]
}
```

Run json-server:
```bash
json-server --watch db.json --port 3000
```

---

## Environment File Setup

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  jsonPlaceholderUrl: 'https://jsonplaceholder.typicode.com',
  githubApiUrl: 'https://api.github.com'
};
```

---

## Daily Commitment

2–3 hours/day at a comfortable pace.
**Days 3–4 (RxJS operators) and Day 7 (Interceptors) are critical** — don't rush them.
Every later pattern builds on these foundations.

Days 1–2 can be compressed into one sitting if you're already comfortable with Angular basics.

---

## Files in This Plan

```
devpulse-plan/
├── README.md           ← This file
├── days/
│   ├── day-01.md
│   ├── day-02.md
│   ├── day-03.md
│   ├── day-04.md
│   ├── day-05.md
│   ├── day-06.md
│   ├── day-07.md
│   ├── day-08.md
│   ├── day-09.md
│   └── day-10.md
└── LEARNING_LOG.md
```
