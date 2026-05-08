# Day 01 — Project Setup + First HTTP GET

## Goal
Scaffold the Angular project, wire up `HttpClient`, connect to `json-server`, and render a live list of posts fetched from a real HTTP endpoint.

---

## Key Steps

- Run `ng new devpulse-dashboard --style=css --routing=true --ssr=false`
- Register `provideHttpClient()` in `app.config.ts`
- Install and run `json-server --watch db.json --port 3000`
- Create `PostService` with `HttpClient` injected
- Call `http.get<Post[]>(url)` and subscribe in `PostListComponent`
- Set up `environment.ts` with `apiUrl: 'http://localhost:3000'`
- Understand what an Observable is vs a Promise (do not convert to Promise — stay in Observable)

---

## Concepts to Explore

- `provideHttpClient()` — replaces old `HttpClientModule` in Angular 21 standalone apps
- `inject(HttpClient)` — functional injection in standalone components/services
- Observable mental model — lazy, nothing happens until `.subscribe()` is called
- `async pipe` in templates — subscribes and auto-unsubscribes, prefer over manual subscribe
- Environment files — separate dev and prod API URLs cleanly

---

## Folder / Files to Create

```
src/app/
├── core/
│   ├── models/
│   │   └── post.model.ts       ← NEW
│   └── services/
│       └── post.service.ts     ← NEW
├── features/
│   └── posts/
│       └── post-list/
│           ├── post-list.component.ts    ← NEW
│           └── post-list.component.html  ← NEW
├── app.config.ts               ← EDIT (add provideHttpClient)
├── app.routes.ts               ← EDIT (add posts route)
└── app.component.html          ← EDIT (add router-outlet)
```

---

## Code

### `src/app/core/models/post.model.ts`
```typescript
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}
```

---

### `src/app/core/services/post.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }
}
```

---

### `src/app/features/posts/post-list/post-list.component.ts`
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './post-list.component.html'
})
export class PostListComponent {
  private postService = inject(PostService);

  // Using async pipe — no manual subscribe, no memory leak
  posts$: Observable<Post[]> = this.postService.getAll();
}
```

---

### `src/app/features/posts/post-list/post-list.component.html`
```html
<div class="page-container">
  <h2>Posts</h2>

  <ng-container *ngIf="posts$ | async as posts; else loading">
    <div class="post-card" *ngFor="let post of posts">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
      <small>User ID: {{ post.userId }}</small>
    </div>
  </ng-container>

  <ng-template #loading>
    <p>Loading posts...</p>
  </ng-template>
</div>
```

---

### `src/app/app.config.ts`
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()   // ← This is all you need
  ]
};
```

---

### `src/app/app.routes.ts`
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'posts',
    loadComponent: () =>
      import('./features/posts/post-list/post-list.component')
        .then(m => m.PostListComponent)
  },
  { path: '', redirectTo: 'posts', pathMatch: 'full' }
];
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `provideHttpClient()` | `app.config.ts` |
| `inject(HttpClient)` | `PostService` |
| `http.get<T>()` | `PostService.getAll()` |
| `Observable<T>` | Return type of service method |
| `async pipe` | `post-list.component.html` |
| `environment.ts` | `apiUrl` abstraction |
| Lazy-loaded route | `app.routes.ts` |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: project setup + provideHttpClient + first GET call from json-server"
```

> **Checkpoint:** Open browser at `http://localhost:4200/posts` — you should see posts loaded from `json-server` running at port 3000.
