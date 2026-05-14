# Day 06 — Progress & Pending Work

**Topic:** `exhaustMap` on form submit + `takeUntilDestroyed` memory-leak audit
**Plan file:** `devpulse-plan/days/day-06.md`
**Audit date:** 2026-05-14

---

## Goal

1. Prevent double-submit race conditions on `PostForm` by routing submissions through a `Subject<PostPayload>` → `exhaustMap` pipeline.
2. Eliminate every memory leak in the app by ensuring all manual `.subscribe()` calls are guarded with `takeUntilDestroyed()`.

---

## Subscription Audit — All Components

| Component | File | Subscription type | Cleanup | Status |
|-----------|------|-------------------|---------|--------|
| `PostForm` | `post-form.ts` | `submitTrigger$` → `exhaustMap` pipeline | `takeUntilDestroyed()` | ✅ Fixed — `onSubmit()` now calls `submitTrigger.next()` |
| `PostList` | `post-list.ts` | `posts$` via `async pipe` | Auto (async pipe) | ✅ |
| `PostList` | `post-list.ts:46` | `deletePost()` — raw `.subscribe()` | `takeUntilDestroyed(destroyRef)` | ✅ Fixed |
| `UserList` | `user-list/user-list.ts` | `users$` via `async pipe` | Auto (async pipe) | ✅ |
| `UserSearch` | `user-search/user-search.ts` | `results$` via `async pipe` | Auto (async pipe) | ✅ |
| `Dashboard` | `dashboard/dashboard.ts` | `dashboardData$` via `async pipe` | Auto (async pipe) | ✅ |

---

## Completed Items ✅

- `Subject<PostPayload> submitTrigger` declared as a class field (`post-form.ts:25`)
- `exhaustMap` pipeline wired in the constructor (`post-form.ts:37–59`)
- `takeUntilDestroyed()` applied to that pipeline (`post-form.ts:48`)
- All other component subscriptions use `async pipe` — no manual cleanup needed there

---

## Pending Issues ❌

### Issue 1 — `onSubmit()` bypasses the exhaustMap pipeline

**File:** `src/app/features/posts/post-form/post-form.ts`
**Lines:** 71–102

**Problem:** `onSubmit()` builds the payload and calls `calls.subscribe()` directly. The `submitTrigger` Subject is never fed a value, so the `exhaustMap` pipeline (lines 37–59) is dead code. Double-submit protection is not active.

**Fix:**
```typescript
// Replace the entire body of onSubmit() with:
onSubmit() {
  if (this.form.invalid) return;

  this.submitTrigger.next({
    title:  this.form.value.title!,
    body:   this.form.value.body!,
    userId: 1
  });
}
```

Also remove the duplicate `isLoading`, `errorMessage`, and `calls.subscribe()` block (lines 82–101) — that logic already lives in the constructor pipeline.

---

### Issue 2 — `PostList` delete subscription has no cleanup

**File:** `src/app/features/posts/post-list/post-list.ts`
**Lines:** 46–53

**Problem:** `this.postService.deletePost(id).subscribe(...)` is a raw subscription with no `takeUntilDestroyed()`. If the component is destroyed while a delete is in flight, the callback still fires.

**Fix:** Move the subscription setup to the constructor and pass `takeUntilDestroyed`, or use a `Subject<number>` trigger pattern — same approach as `PostForm`. Alternatively, since this is a one-shot call (not a long-lived stream), the simpler fix is:

```typescript
// In the constructor, inject DestroyRef for use in methods
private destroyRef = inject(DestroyRef);

// In onFormCancelled():
this.postService.deletePost(id).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe({ ... });
```

---

## Definition of Done — Day 06 Checklist

- [x] `onSubmit()` calls `this.submitTrigger.next(payload)` — no direct `.subscribe()` inside it
- [x] Duplicate `isLoading`/`errorMessage`/`calls.subscribe()` block removed from `onSubmit()`
- [ ] Verified in browser: rapid double-click on Save fires only **one** HTTP POST (check DevTools → Network)
- [x] `PostList` delete subscription guarded with `takeUntilDestroyed(this.destroyRef)`
- [ ] `git commit -m "feat: exhaustMap on form submit + takeUntilDestroyed memory leak fixes"`
- [ ] `Learnings/day_06_learning.md` written

---

## Day 07 Preview (HTTP Interceptors)

`src/app/core/interceptors/` does not exist yet. Day 07 will build:
- An **auth interceptor** (attach token to outgoing requests)
- A **logging interceptor** (log request/response metadata)
- Register both via `withInterceptors([authInterceptor, loggingInterceptor])` in `app.config.ts`
