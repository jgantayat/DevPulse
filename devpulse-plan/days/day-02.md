# Day 02 — CRUD Operations + Typed Responses

## Goal
Implement full Create, Read, Update, Delete using `HttpClient`. Introduce TypeScript interfaces for all response shapes, manual loading/error states, and understand when `async pipe` is not enough.

---

## Key Steps

- Add `POST`, `PUT`, `DELETE` methods to `PostService`
- Build a `PostFormComponent` for creating and editing posts
- Add loading boolean and error message to component state
- Show a loading indicator while any HTTP call is in flight
- Use `HttpHeaders` to send `Content-Type: application/json`
- Understand the difference between `subscribe()` callback and `async pipe` — know when to use each
- Wire Delete with a confirmation before calling the service

---

## Concepts to Explore

- `http.post<T>(url, body, options)` — body is plain object, Angular serializes it
- `http.put<T>(url, body)` — full replace; `http.patch()` for partial update
- `http.delete<void>(url)` — json-server returns `{}` on delete
- `HttpHeaders` — set request-level headers per call
- Manual `subscribe()` with `next`, `error`, `complete` callbacks — needed for side effects (navigate, reset form)
- Loading flag pattern — set `true` before call, `false` in both `next` and `error`
- Why `async pipe` can't handle forms — you need manual subscribe for form submit flow

---

## Folder / Files to Create

```
src/app/
├── core/
│   └── services/
│       └── post.service.ts     ← EDIT (add post, put, delete methods)
├── features/
│   └── posts/
│       ├── post-list/
│       │   ├── post-list.component.ts    ← EDIT (add delete + edit trigger)
│       │   └── post-list.component.html  ← EDIT
│       └── post-form/
│           ├── post-form.component.ts    ← NEW
│           └── post-form.component.html  ← NEW
└── shared/
    └── components/
        ├── loading-spinner/
        │   └── loading-spinner.component.ts  ← NEW
        └── error-banner/
            └── error-banner.component.ts     ← NEW
```

---

## Code

### `src/app/core/models/post.model.ts` (updated)
```typescript
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Used for create/edit form — id is optional before creation
export interface PostPayload {
  title: string;
  body: string;
  userId: number;
}
```

---

### `src/app/core/services/post.service.ts` (full updated)
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, PostPayload } from '../models/post.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  create(payload: PostPayload): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, payload, { headers: this.headers });
  }

  update(id: number, payload: PostPayload): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, payload, { headers: this.headers });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

### `src/app/features/posts/post-form/post-form.component.ts`
```typescript
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post, PostPayload } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './post-form.component.html'
})
export class PostFormComponent implements OnInit {
  @Input() editPost: Post | null = null;  // null = create mode
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private postService = inject(PostService);

  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    body:  ['', Validators.required]
  });

  ngOnInit() {
    // Pre-fill form when editing
    if (this.editPost) {
      this.form.patchValue({
        title: this.editPost.title,
        body: this.editPost.body
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload: PostPayload = {
      title: this.form.value.title!,
      body:  this.form.value.body!,
      userId: 1
    };

    this.isLoading = true;
    this.errorMessage = '';

    const call$ = this.editPost
      ? this.postService.update(this.editPost.id, payload)
      : this.postService.create(payload);

    // Manual subscribe — needed here because we have side effects (emit, reset)
    call$.subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.saved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to save post. Please try again.';
        console.error(err);
      }
    });
  }
}
```

---

### `src/app/features/posts/post-form/post-form.component.html`
```html
<div class="form-container">
  <h3>{{ editPost ? 'Edit Post' : 'Create Post' }}</h3>

  <div *ngIf="errorMessage" class="error-banner">
    {{ errorMessage }}
  </div>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-field">
      <label>Title</label>
      <input formControlName="title" placeholder="Post title" />
      <span *ngIf="form.get('title')?.invalid && form.get('title')?.touched" class="field-error">
        Title is required (min 3 chars)
      </span>
    </div>

    <div class="form-field">
      <label>Body</label>
      <textarea formControlName="body" rows="4" placeholder="Post content"></textarea>
      <span *ngIf="form.get('body')?.invalid && form.get('body')?.touched" class="field-error">
        Body is required
      </span>
    </div>

    <div class="form-actions">
      <button type="button" (click)="cancelled.emit()">Cancel</button>
      <button type="submit" [disabled]="form.invalid || isLoading">
        {{ isLoading ? 'Saving...' : (editPost ? 'Update' : 'Create') }}
      </button>
    </div>
  </form>
</div>
```

---

### `src/app/features/posts/post-list/post-list.component.ts` (updated)
```typescript
import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { Observable } from 'rxjs';
import { PostFormComponent } from '../post-form/post-form.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, PostFormComponent],
  templateUrl: './post-list.component.html'
})
export class PostListComponent {
  private postService = inject(PostService);

  posts$: Observable<Post[]> = this.postService.getAll();
  showForm = false;
  editingPost: Post | null = null;
  deleteError = '';

  openCreateForm() {
    this.editingPost = null;
    this.showForm = true;
  }

  openEditForm(post: Post) {
    this.editingPost = post;
    this.showForm = true;
  }

  onSaved() {
    this.showForm = false;
    // Refresh list by re-triggering the observable
    this.posts$ = this.postService.getAll();
  }

  onDelete(id: number) {
    if (!confirm('Delete this post?')) return;
    this.postService.delete(id).subscribe({
      next: () => { this.posts$ = this.postService.getAll(); },
      error: () => { this.deleteError = 'Delete failed.'; }
    });
  }
}
```

---

### `src/app/features/posts/post-list/post-list.component.html` (updated)
```html
<div class="page-container">
  <div class="page-header">
    <h2>Posts</h2>
    <button (click)="openCreateForm()">+ New Post</button>
  </div>

  <div *ngIf="deleteError" class="error-banner">{{ deleteError }}</div>

  <app-post-form
    *ngIf="showForm"
    [editPost]="editingPost"
    (saved)="onSaved()"
    (cancelled)="showForm = false">
  </app-post-form>

  <ng-container *ngIf="posts$ | async as posts; else loading">
    <div *ngIf="posts.length === 0">No posts yet.</div>

    <div class="post-card" *ngFor="let post of posts">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
      <div class="post-actions">
        <button (click)="openEditForm(post)">Edit</button>
        <button (click)="onDelete(post.id)" class="danger">Delete</button>
      </div>
    </div>
  </ng-container>

  <ng-template #loading>
    <p>Loading...</p>
  </ng-template>
</div>
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `http.post<T>()` | `PostService.create()` |
| `http.put<T>()` | `PostService.update()` |
| `http.delete<void>()` | `PostService.delete()` |
| `HttpHeaders` | Content-Type on write calls |
| Manual `subscribe()` with `next/error` | `PostFormComponent.onSubmit()` |
| Loading flag pattern | `isLoading` in form component |
| `@Input()` / `@Output()` | Parent-child form communication |
| `ReactiveFormsModule` | Form validation + patchValue |
| `async pipe` vs manual subscribe | List uses async pipe; form uses manual |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: full CRUD with typed Post interface, loading states, reactive form"
```

> **Checkpoint:** You can create, edit, and delete posts. The form shows loading state during save and an error message if the call fails.
