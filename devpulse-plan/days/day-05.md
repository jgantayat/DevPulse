# Day 05 — forkJoin + mergeMap (Parallel + Dependent Calls)

## Goal
Build the Dashboard page that fires multiple HTTP calls simultaneously and waits for all to complete. Also learn `mergeMap` for making dependent calls — when you need one response to trigger the next request.

---

## Key Steps

- Create a `DashboardService` that uses `forkJoin` to call posts + users + todos simultaneously
- Build a summary dashboard card for each data source
- Use `mergeMap` to fetch each user's posts after getting the user list
- Understand the difference between `forkJoin` (completes) vs `combineLatest` (ongoing)
- Handle partial failure — one failing call should not break the entire dashboard

---

## Concepts to Explore

- `forkJoin([obs1, obs2, obs3])` — fires all in parallel, emits once when ALL complete
- `forkJoin` requires all Observables to complete — works perfectly for HTTP (one-shot)
- Partial failure protection — wrap each source with `catchError` before passing to `forkJoin`
- `mergeMap(item => httpCall)` — for each item, make a call; all calls run in parallel
- `mergeMap` vs `switchMap` — mergeMap does NOT cancel, all calls run
- `combineLatest([obs1, obs2])` — re-emits when ANY source emits (for ongoing streams, not HTTP)
- When to use `forkJoin` vs `combineLatest` — HTTP vs ongoing Observables

---

## Folder / Files to Create

```
src/app/
├── core/
│   ├── models/
│   │   └── todo.model.ts           ← NEW
│   └── services/
│       ├── todo.service.ts         ← NEW
│       └── dashboard.service.ts    ← NEW
└── features/
    └── dashboard/
        ├── dashboard.component.ts    ← NEW
        └── dashboard.component.html  ← NEW
```

---

## Code

### `src/app/core/models/todo.model.ts`
```typescript
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export interface DashboardData {
  totalPosts: number;
  totalUsers: number;
  completedTodos: number;
  pendingTodos: number;
}
```

---

### `src/app/core/services/todo.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Todo } from '../models/todo.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.jsonPlaceholderUrl}/todos`;

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }
}
```

---

### `src/app/core/services/dashboard.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PostService } from './post.service';
import { UserService } from './user.service';
import { TodoService } from './todo.service';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Todo, DashboardData } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private postService = inject(PostService);
  private userService = inject(UserService);
  private todoService = inject(TodoService);

  // forkJoin: fires all 3 calls in parallel, waits for ALL to complete
  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      // Each wrapped with catchError so one failure doesn't kill the whole dashboard
      posts: this.postService.getAll().pipe(catchError(() => of([]))),
      users: this.userService.getUsers().pipe(catchError(() => of([]))),
      todos: this.todoService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(({ posts, users, todos }) => ({
        totalPosts:     posts.length,
        totalUsers:     users.length,
        completedTodos: todos.filter(t => t.completed).length,
        pendingTodos:   todos.filter(t => !t.completed).length
      }))
    );
  }

  // mergeMap: get all users, then for each user fetch their posts simultaneously
  getUsersWithPostCount(): Observable<(User & { postCount: number })[]> {
    return this.userService.getUsers().pipe(
      // mergeMap fires all user-post calls in parallel (no cancellation — we want ALL)
      mergeMap(users =>
        forkJoin(
          users.map(user =>
            this.http.get<Post[]>(
              `https://jsonplaceholder.typicode.com/users/${user.id}/posts`
            ).pipe(
              map(posts => ({ ...user, postCount: posts.length })),
              catchError(() => of({ ...user, postCount: 0 }))
            )
          )
        )
      )
    );
  }
}

// Note: add HttpClient to DashboardService imports
import { mergeMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
```

---

### `src/app/features/dashboard/dashboard.component.ts`
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardData } from '../../core/models/todo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);

  // Single subscription — forkJoin handles all 3 calls internally
  dashboardData$: Observable<DashboardData> = this.dashboardService.getDashboardData();
}
```

---

### `src/app/features/dashboard/dashboard.component.html`
```html
<div class="page-container">
  <h2>Dashboard</h2>

  <ng-container *ngIf="dashboardData$ | async as data; else loading">
    <div class="kpi-grid">

      <div class="kpi-card">
        <div class="kpi-value">{{ data.totalPosts }}</div>
        <div class="kpi-label">Total Posts</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-value">{{ data.totalUsers }}</div>
        <div class="kpi-label">Active Users</div>
      </div>

      <div class="kpi-card success">
        <div class="kpi-value">{{ data.completedTodos }}</div>
        <div class="kpi-label">Completed Todos</div>
      </div>

      <div class="kpi-card warning">
        <div class="kpi-value">{{ data.pendingTodos }}</div>
        <div class="kpi-label">Pending Todos</div>
      </div>

    </div>
  </ng-container>

  <ng-template #loading>
    <p>Loading dashboard...</p>
  </ng-template>
</div>
```

---

## forkJoin vs combineLatest — Know the Difference

```
forkJoin([obs1$, obs2$, obs3$])
  - Waits for ALL sources to COMPLETE
  - Emits exactly ONCE with final values from each
  - Perfect for HTTP calls (they complete after one response)
  - If any source errors and you don't protect it → entire forkJoin errors

combineLatest([obs1$, obs2$, obs3$])
  - Emits every time ANY source emits a new value
  - All sources must emit at least once before it emits
  - Perfect for ongoing streams (dropdown filters, form fields)
  - Does NOT complete when sources complete
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `forkJoin({})` | Parallel dashboard data load |
| Partial failure protection | Each source wrapped with `catchError(() => of([]))` |
| `map()` after forkJoin | Aggregate counts from all three responses |
| `mergeMap()` | Fetch posts per user after getting user list |
| Nested `forkJoin` | Fire all user-post calls simultaneously inside mergeMap |
| `forkJoin` vs `combineLatest` | HTTP (one-shot) vs ongoing streams |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: dashboard with forkJoin parallel calls + mergeMap dependent calls"
```

> **Checkpoint:** Open Dashboard — check Network tab. You should see posts, users, and todos requests firing simultaneously (same timestamp), not one after another.
