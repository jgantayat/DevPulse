# Day 03 — map, tap, filter, catchError

## Goal
Stop passing raw API responses directly to templates. Learn to transform, guard, and handle errors in the Observable pipeline using RxJS operators — all inside the service layer, not the component.

---

## Key Steps

- Switch from JSONPlaceholder users API (real external API, no json-server needed)
- Use `map()` to extract only needed fields from the response
- Use `tap()` to log without touching the stream
- Use `filter()` to skip null/empty emissions
- Use `catchError()` to return a fallback instead of crashing
- Chain all operators inside `pipe()`
- Understand marble diagrams — visit `rxmarbles.com` for visual learning

---

## Concepts to Explore

- `pipe()` — chains multiple operators in sequence, reads top to bottom
- `map(data => transform)` — same as `Array.map` but for stream values
- `tap(val => sideEffect)` — look at value without changing it (logging, analytics)
- `filter(val => condition)` — if condition is false, value is blocked from downstream
- `catchError(err => fallback$)` — intercept error, return `of([])` or rethrow with `throwError()`
- `throwError(() => new Error())` — rethrow when you want component to handle it
- `of(fallbackValue)` — wrap a value as an Observable (used as safe fallback)
- Error does NOT automatically recover — once errored, Observable is dead unless you use catchError

---

## Folder / Files to Create

```
src/app/
├── core/
│   ├── models/
│   │   └── user.model.ts       ← NEW
│   └── services/
│       └── user.service.ts     ← NEW
└── features/
    └── users/
        └── user-list/
            ├── user-list.component.ts    ← NEW
            └── user-list.component.html  ← NEW
```

---

## Code

### `src/app/core/models/user.model.ts`
```typescript
// Full shape returned by JSONPlaceholder /users
export interface UserApiResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    city: string;
    zipcode: string;
  };
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

// Trimmed model — only what our UI needs
export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  company: string;
}
```

---

### `src/app/core/services/user.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, filter, catchError } from 'rxjs/operators';
import { User, UserApiResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.jsonPlaceholderUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<UserApiResponse[]>(this.apiUrl).pipe(

      // tap: log raw response — doesn't touch or change the stream
      tap(raw => console.log('[UserService] Raw API response:', raw)),

      // map: transform full response into trimmed User shape
      map(users =>
        users.map(u => ({
          id:      u.id,
          name:    u.name,
          email:   u.email,
          city:    u.address.city,
          company: u.company.name
        }))
      ),

      // filter: block the emission if the array is empty for any reason
      filter(users => users.length > 0),

      // catchError: if anything above throws, return empty array instead of crashing
      catchError(err => {
        console.error('[UserService] Failed to load users:', err);
        return of([]); // graceful fallback — component gets empty array
      })
    );
  }

  getUserById(id: number): Observable<User | null> {
    return this.http.get<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(u => ({
        id:      u.id,
        name:    u.name,
        email:   u.email,
        city:    u.address.city,
        company: u.company.name
      })),
      catchError(err => {
        // 404 or network error — return null instead of crashing
        console.error('[UserService] User not found:', err);
        return of(null);
      })
    );
  }
}
```

---

### `src/app/features/users/user-list/user-list.component.ts`
```typescript
import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  private userService = inject(UserService);

  // Component receives already-trimmed User[], not raw API shape
  users$: Observable<User[]> = this.userService.getUsers();
}
```

---

### `src/app/features/users/user-list/user-list.component.html`
```html
<div class="page-container">
  <h2>Users</h2>

  <ng-container *ngIf="users$ | async as users; else loading">

    <div *ngIf="users.length === 0" class="empty-state">
      No users found.
    </div>

    <div class="user-card" *ngFor="let user of users">
      <div class="user-name">{{ user.name }}</div>
      <div class="user-meta">{{ user.email }}</div>
      <div class="user-meta">{{ user.city }} — {{ user.company }}</div>
    </div>

  </ng-container>

  <ng-template #loading>
    <p>Loading users...</p>
  </ng-template>
</div>
```

---

## Understanding the Pipeline (Read This Carefully)

```
http.get<UserApiResponse[]>(url)
  │
  ▼ tap()        → side effect (log), value passes through unchanged
  │
  ▼ map()        → UserApiResponse[] becomes User[] (trimmed shape)
  │
  ▼ filter()     → if array is empty, emission is blocked entirely
  │
  ▼ catchError() → if ANY step above threw an error, recover with of([])
  │
  ▼ Component receives: User[] or [] — never crashes
```

### When to use `of([])` vs `throwError()`

```typescript
// Use of([]) when the component should show empty state
catchError(() => of([]))

// Use throwError() when the component needs to handle the error itself
catchError(err => throwError(() => err))
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `pipe()` | Chains all operators in `user.service.ts` |
| `map()` | Trims `UserApiResponse[]` → `User[]` |
| `tap()` | Logs raw response before transform |
| `filter()` | Blocks empty array from reaching component |
| `catchError()` | Returns `of([])` as fallback on HTTP error |
| `of()` | Wraps fallback value as Observable |
| Two TypeScript models | `UserApiResponse` vs `User` (separation of concern) |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: rxjs map + tap + filter + catchError on users API"
```

> **Checkpoint:** Open browser at `/users` — users load with trimmed data. Temporarily break the URL in `environment.ts` to test catchError — page should show empty state instead of error.
