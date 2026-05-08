# Day 04 — switchMap + debounceTime (Live Search)

## Goal
Build a live search bar that queries the API as the user types — but only after they pause, and always cancelling stale in-flight requests. This is the most important RxJS pattern in Angular forms.

---

## Key Steps

- Create a search input wired to a `FormControl`
- Use `valueChanges` Observable from `FormControl` as the source stream
- Apply `debounceTime(300)` to wait until the user stops typing
- Apply `distinctUntilChanged()` to skip duplicate values
- Use `switchMap()` to cancel the previous HTTP request and fire a new one
- Add a loading indicator driven by `tap()` on the stream
- Understand WHY `mergeMap` would cause a race condition here

---

## Concepts to Explore

- `FormControl.valueChanges` — Observable that emits every time the input changes
- `debounceTime(ms)` — only emits after silence of N milliseconds
- `distinctUntilChanged()` — skips emission if the value is the same as the last one
- `switchMap(val => Observable)` — cancels previous inner Observable, subscribes to new one
- Race condition — why typing fast with `mergeMap` would render results out of order
- `startWith('')` — emit an initial value to trigger the first load automatically
- `Subject` as a manual trigger — alternative to `valueChanges` for non-form scenarios

---

## Folder / Files to Create

```
src/app/
├── core/
│   └── services/
│       └── user.service.ts     ← EDIT (add search method)
└── features/
    └── search/
        └── user-search/
            ├── user-search.component.ts    ← NEW
            └── user-search.component.html  ← NEW
```

---

## Code

### `src/app/core/services/user.service.ts` (add search method)
```typescript
// Add this method to the existing UserService

searchUsers(query: string): Observable<User[]> {
  // JSONPlaceholder doesn't support real search, so we filter client-side
  // In a real Java backend: GET /users?name_like=query
  return this.http.get<UserApiResponse[]>(this.apiUrl).pipe(
    map(users =>
      users
        .filter(u =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        )
        .map(u => ({
          id:      u.id,
          name:    u.name,
          email:   u.email,
          city:    u.address.city,
          company: u.company.name
        }))
    ),
    catchError(() => of([]))
  );
}
```

---

### `src/app/features/search/user-search/user-search.component.ts`
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  startWith,
  catchError
} from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgFor, NgIf],
  templateUrl: './user-search.component.html'
})
export class UserSearchComponent implements OnInit {
  private userService = inject(UserService);

  searchControl = new FormControl('');
  isSearching = false;
  results$!: Observable<User[]>;

  ngOnInit() {
    this.results$ = this.searchControl.valueChanges.pipe(

      // startWith triggers the pipeline on init with empty string
      startWith(''),

      // Wait 300ms after user stops typing
      debounceTime(300),

      // Don't re-search if value hasn't actually changed
      distinctUntilChanged(),

      // Set loading flag before the HTTP call goes out
      tap(() => (this.isSearching = true)),

      // switchMap: cancel previous request, fire new one with latest query
      switchMap(query =>
        this.userService.searchUsers(query ?? '').pipe(
          // catchError here protects the outer stream — search stays alive even on error
          catchError(() => of([]))
        )
      ),

      // Clear loading flag once results arrive (or error occurred)
      tap(() => (this.isSearching = false))
    );
  }
}
```

---

### `src/app/features/search/user-search/user-search.component.html`
```html
<div class="page-container">
  <h2>User Search</h2>

  <div class="search-bar">
    <input
      [formControl]="searchControl"
      placeholder="Search by name or email..."
      class="search-input"
    />
    <span *ngIf="isSearching" class="searching-indicator">Searching...</span>
  </div>

  <ng-container *ngIf="results$ | async as users">

    <p class="results-count">{{ users.length }} result(s)</p>

    <div *ngIf="users.length === 0 && !isSearching" class="empty-state">
      No users match your search.
    </div>

    <div class="user-card" *ngFor="let user of users">
      <div class="user-name">{{ user.name }}</div>
      <div class="user-meta">{{ user.email }}</div>
      <div class="user-meta">{{ user.city }} — {{ user.company }}</div>
    </div>

  </ng-container>
</div>
```

---

## Why switchMap and NOT mergeMap Here

```
User types fast: "j" → "ja" → "jay"

With mergeMap (WRONG):
  Request for "j"   → still running...
  Request for "ja"  → still running...
  Request for "jay" → completes FIRST (shorter response)
  Request for "ja"  → completes SECOND  ← UI shows wrong results!
  Request for "j"   → completes LAST    ← UI now shows "j" results!

With switchMap (CORRECT):
  Request for "j"   → CANCELLED when "ja" comes in
  Request for "ja"  → CANCELLED when "jay" comes in
  Request for "jay" → completes → UI shows correct results ✓
```

---

## The Full Pipeline Visualized

```
searchControl.valueChanges
  │
  ▼ startWith('')       → triggers pipeline immediately on init
  │
  ▼ debounceTime(300)   → waits 300ms of silence before passing through
  │
  ▼ distinctUntilChanged() → skips if same value as last emission
  │
  ▼ tap(set isSearching=true)
  │
  ▼ switchMap(query =>  → CANCELS old request, starts new search
       searchUsers(query)
         .pipe(catchError → of([])) ← inner protection
    )
  │
  ▼ tap(set isSearching=false)
  │
  ▼ Template receives User[] via async pipe
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `FormControl.valueChanges` | Source Observable for search |
| `startWith('')` | Trigger initial load on component init |
| `debounceTime(300)` | Wait for typing pause before firing API |
| `distinctUntilChanged()` | Skip redundant searches |
| `switchMap()` | Cancel old request, use latest query |
| `tap()` | Drive `isSearching` flag without changing stream |
| Inner `catchError()` | Protect outer stream — search stays alive on error |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: live search with switchMap + debounce + distinctUntilChanged"
```

> **Checkpoint:** Type quickly in the search box — open Network tab in DevTools. You should see previous requests being cancelled (shown as red in Chrome). Only the last request completes.
