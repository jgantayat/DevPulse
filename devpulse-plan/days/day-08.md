# Day 08 — State Management with Signals + BehaviorSubject

## Goal
Stop re-fetching data every time a component renders. Store API responses in a service-level reactive state using Angular Signals. Understand `BehaviorSubject` as the RxJS equivalent, and know when to use each.

---

## Key Steps

- Refactor `PostService` to store posts in a `signal()` instead of always calling HTTP
- Use `computed()` to derive filtered/sorted views without extra HTTP calls
- Use `effect()` to react to signal changes (log, persist, side effects)
- Understand `BehaviorSubject` and `asObservable()` — the RxJS equivalent pattern
- Know the bridge: `toSignal()` and `toObservable()` for mixing both worlds

---

## Concepts to Explore

- `signal<T>(initialValue)` — writable reactive value
- `signal.set(value)` — replace entire value
- `signal.update(prev => newVal)` — derive next value from previous
- `signal.asReadonly()` — expose read-only signal to components (prevent external mutation)
- `computed(() => derivedValue)` — auto-updates when dependent signals change
- `effect(() => sideEffect)` — runs when any read signal inside changes
- `BehaviorSubject<T>(initialValue)` — RxJS equivalent; emits current value to new subscribers
- `subject.asObservable()` — expose read-only stream (same as `signal.asReadonly()` in concept)
- `toSignal(observable$)` — convert Observable to Signal (requires injection context)
- `toObservable(signal)` — convert Signal to Observable

---

## Folder / Files to Create

```
src/app/
└── core/
    └── services/
        ├── post.service.ts       ← REFACTOR (add signal-based state)
        └── auth.service.ts       ← NEW (BehaviorSubject example for auth token)
```

---

## Code

### `src/app/core/services/post.service.ts` (full refactor with signals)
```typescript
import { inject, Injectable, computed, signal, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Post, PostPayload } from '../models/post.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // ─── Signal-based state ────────────────────────────────────────────
  private _posts = signal<Post[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Read-only signals exposed to components
  readonly posts = this._posts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // computed: derived state — no extra HTTP call, auto-updates when _posts changes
  readonly postCount = computed(() => this._posts().length);
  readonly hasPosts = computed(() => this._posts().length > 0);

  // Computed with filter — e.g. only posts by user 1
  readonly myPosts = computed(() =>
    this._posts().filter(p => p.userId === 1)
  );

  // effect: runs whenever _posts or _isLoading changes (for logging/debugging)
  constructor() {
    effect(() => {
      console.log('[PostService] posts count:', this._posts().length);
      console.log('[PostService] loading:', this._isLoading());
    });
  }

  // ─── HTTP Methods ────────────────────────────────────────────────────

  loadAll(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<Post[]>(this.apiUrl).subscribe({
      next: (posts) => {
        this._posts.set(posts);         // store in signal
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load posts.');
        this._isLoading.set(false);
      }
    });
  }

  create(payload: PostPayload): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, payload, { headers: this.headers }).pipe(
      tap(newPost => {
        // Optimistically update signal — no need to re-fetch entire list
        this._posts.update(current => [...current, newPost]);
      })
    );
  }

  update(id: number, payload: PostPayload): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, payload, { headers: this.headers }).pipe(
      tap(updated => {
        this._posts.update(current =>
          current.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remove from signal immediately
        this._posts.update(current => current.filter(p => p.id !== id));
      })
    );
  }
}
```

---

### Updated `post-list.component.ts` — read from signal instead of Observable

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { PostFormComponent } from '../post-form/post-form.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [NgFor, NgIf, PostFormComponent],
  templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit {
  postService = inject(PostService); // public so template can read signals directly

  showForm = false;
  editingPost = null;

  ngOnInit() {
    this.postService.loadAll(); // triggers load once, stores result in signal
  }
}
```

---

### Updated `post-list.component.html` — read signals with `()`

```html
<div class="page-container">
  <div class="page-header">
    <h2>Posts ({{ postService.postCount() }})</h2>
    <button (click)="showForm = true">+ New Post</button>
  </div>

  <!-- Reading signals: call them like functions with () -->
  <div *ngIf="postService.error()">{{ postService.error() }}</div>

  <p *ngIf="postService.isLoading()">Loading...</p>

  <app-post-form
    *ngIf="showForm"
    (saved)="showForm = false"
    (cancelled)="showForm = false">
  </app-post-form>

  <div *ngIf="!postService.isLoading()">
    <div *ngIf="!postService.hasPosts()">No posts yet.</div>

    <div class="post-card" *ngFor="let post of postService.posts()">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
    </div>
  </div>
</div>
```

---

### `src/app/core/services/auth.service.ts` — BehaviorSubject pattern (for reference)
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// BehaviorSubject is the RxJS equivalent of signal()
// Use this when you need to bridge into RxJS pipelines (interceptors, switchMap, etc.)

@Injectable({ providedIn: 'root' })
export class AuthService {
  // BehaviorSubject holds the current value and emits it to new subscribers
  private _token = new BehaviorSubject<string | null>(null);

  // asObservable() = read-only stream (like signal.asReadonly())
  readonly token$: Observable<string | null> = this._token.asObservable();

  // Convenience getter for current value (no subscribe needed)
  get currentToken(): string | null {
    return this._token.getValue();
  }

  setToken(token: string): void {
    this._token.next(token);
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this._token.next(null);
    localStorage.removeItem('auth_token');
  }
}
```

---

## Signals vs BehaviorSubject — When to Use Which

```
Signals
  ✅ Component state and UI-bound reactive values
  ✅ Computed/derived values (replaces memoization)
  ✅ Simple service state (store API response)
  ✅ Works natively with Angular's change detection
  ❌ Can't directly pipe with RxJS operators

BehaviorSubject
  ✅ When you need to pipe state into RxJS chains (switchMap, combineLatest)
  ✅ Auth token in interceptors (interceptors use Observables, not signals)
  ✅ Cross-service reactive communication
  ❌ More boilerplate than signals

Bridge (use both together):
  toSignal(behaviorSubject.asObservable())   → use in template
  toObservable(mySignal)                     → use in RxJS pipe
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `signal<T>()` | `_posts`, `_isLoading`, `_error` in PostService |
| `signal.set()` | Replace state after HTTP load |
| `signal.update()` | Optimistic add/update/delete |
| `signal.asReadonly()` | Exposed to components |
| `computed()` | `postCount`, `hasPosts`, `myPosts` |
| `effect()` | Debug logging in constructor |
| `BehaviorSubject` | `AuthService._token` |
| `asObservable()` | Read-only stream exposure |
| `getValue()` | Synchronous current value access |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "refactor: signals-based state in PostService + BehaviorSubject in AuthService"
```

> **Checkpoint:** Posts list now loads once and stores in signal. Create/Edit/Delete updates the signal optimistically — no full re-fetch. Open DevTools → Network tab: on delete, you should see only one DELETE request, not a follow-up GET.
