# Day 06 — exhaustMap + takeUntilDestroyed

## Goal
Prevent double-submit race conditions on forms using `exhaustMap`, and fix all memory leaks in the app by adding proper unsubscription with `takeUntilDestroyed`.

---

## Key Steps

- Understand what a memory leak looks like in Angular and why it's dangerous
- Refactor `PostFormComponent` submit button to use `exhaustMap`
- Add `takeUntilDestroyed()` to every manual `.subscribe()` in the app
- Understand when `async pipe` saves you vs when you must manually unsubscribe
- Audit the entire project for subscriptions that are not cleaned up

---

## Concepts to Explore

- `exhaustMap(val => Observable)` — ignores new emissions while inner Observable is active
- Use case: form submit — user clicks Save twice, only first click fires, second is ignored
- Contrast: `switchMap` cancels old, `mergeMap` runs all, `exhaustMap` ignores new
- Memory leak — a subscription that outlives its component holds a reference in memory
- `takeUntilDestroyed()` from `@angular/core/rxjs-interop` — auto-completes when component destroys
- Must be called in injection context (constructor, field initializer) — NOT in `ngOnInit`
- Old pattern for reference: `Subject + takeUntil(this.destroy$) + ngOnDestroy` — know this for legacy code
- `async pipe` is the cleanest pattern — auto-unsubscribes, no manual cleanup needed

---

## Folder / Files to Create

```
src/app/
└── features/
    └── posts/
        └── post-form/
            └── post-form.component.ts    ← EDIT (refactor submit with exhaustMap)
```

All other changes are EDIT to existing components (add takeUntilDestroyed).

---

## Code

### Refactored `post-form.component.ts` — exhaustMap on submit

```typescript
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Subject, exhaustMap } from 'rxjs';
import { PostService } from '../../../core/services/post.service';
import { Post, PostPayload } from '../../../core/models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './post-form.component.html'
})
export class PostFormComponent implements OnInit {
  @Input() editPost: Post | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private postService = inject(PostService);

  isLoading = false;
  errorMessage = '';

  // Subject acts as the submit trigger stream
  private submitTrigger$ = new Subject<PostPayload>();

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    body:  ['', Validators.required]
  });

  constructor() {
    // Wire exhaustMap HERE in constructor (injection context required for takeUntilDestroyed)
    this.submitTrigger$.pipe(

      // exhaustMap: if a save is in progress, ignore new submit clicks entirely
      exhaustMap(payload => {
        this.isLoading = true;
        this.errorMessage = '';

        const call$ = this.editPost
          ? this.postService.update(this.editPost.id, payload)
          : this.postService.create(payload);

        return call$;
      }),

      // Auto-complete this subscription when the component is destroyed
      takeUntilDestroyed()

    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.saved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to save. Please try again.';
      }
    });
  }

  ngOnInit() {
    if (this.editPost) {
      this.form.patchValue({
        title: this.editPost.title,
        body:  this.editPost.body
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    // Push payload into the Subject — exhaustMap decides whether to act on it
    this.submitTrigger$.next({
      title:  this.form.value.title!,
      body:   this.form.value.body!,
      userId: 1
    });
  }
}
```

---

### Adding `takeUntilDestroyed()` to existing subscriptions

If any component has a manual `.subscribe()` outside of `async pipe`, add this:

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class SomeComponent {
  constructor() {
    // ✅ Called in constructor (injection context) — works correctly
    someObservable$.pipe(
      takeUntilDestroyed()
    ).subscribe(data => {
      // handle data
    });
  }
}
```

If you must subscribe in `ngOnInit`, inject `DestroyRef` manually:

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class SomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef); // inject in field — still injection context

  ngOnInit() {
    someObservable$.pipe(
      takeUntilDestroyed(this.destroyRef) // pass destroyRef explicitly
    ).subscribe(data => {
      // handle data
    });
  }
}
```

---

## The Three Flattening Operators — Final Comparison

```
Scenario: User clicks a button that triggers an HTTP call.
          User clicks again before first call completes.

switchMap   → CANCELS old call, starts new one
             Best for: search inputs, typeahead, navigation

mergeMap    → RUNS BOTH calls simultaneously
             Best for: independent parallel work (upload multiple files)

exhaustMap  → IGNORES the new click, old call continues
             Best for: form submit, login button, payment button
```

---

## Subscription Audit Checklist

Go through every component and mark each subscription:

| Component | Subscription Type | Cleanup Method |
|---|---|---|
| `PostListComponent` | `async pipe` on `posts$` | ✅ Auto (async pipe) |
| `PostListComponent` | Manual subscribe on delete | ⚠️ Add `takeUntilDestroyed` |
| `PostFormComponent` | `submitTrigger$` exhaustMap | ✅ `takeUntilDestroyed()` |
| `UserListComponent` | `async pipe` on `users$` | ✅ Auto (async pipe) |
| `UserSearchComponent` | `async pipe` on `results$` | ✅ Auto (async pipe) |
| `DashboardComponent` | `async pipe` on `dashboardData$` | ✅ Auto (async pipe) |

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `exhaustMap()` | Form submit — ignore double-clicks |
| `Subject` as trigger | `submitTrigger$` feeds the exhaustMap pipeline |
| `takeUntilDestroyed()` | Auto-cleanup on component destroy |
| `DestroyRef` | Explicit cleanup when outside constructor |
| Subscription audit | Every component reviewed |
| `switchMap` vs `mergeMap` vs `exhaustMap` | Final comparison table |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: exhaustMap on form submit + takeUntilDestroyed memory leak fixes"
```

> **Checkpoint:** Click Save rapidly multiple times — only one HTTP request should fire. Check DevTools → Network tab: no duplicate POST requests even with fast double-clicks.
