# Day 05 — RxJS Parallel & Combination Operators

> A beginner-friendly deep dive into `forkJoin`, `mergeMap`, `switchMap`, and `combineLatest` — with diagrams and examples.

---

## Table of Contents

1. [What is an Observable?](#what-is-an-observable)
2. [forkJoin — Run everything in parallel, wait for all to finish](#1-forkjoin--run-everything-in-parallel-wait-for-all-to-finish)
3. [Partial failure protection — catchError before forkJoin](#2-partial-failure-protection--catcherror-before-forkjoin)
4. [mergeMap — For each item, fire a parallel HTTP call](#3-mergemap--for-each-item-fire-a-parallel-http-call)
5. [mergeMap vs switchMap — The cancellation difference](#4-mergemap-vs-switchmap--the-cancellation-difference)
6. [combineLatest — Re-emit whenever any source updates](#5-combinellatest--re-emit-whenever-any-source-updates)
7. [forkJoin vs combineLatest — Choosing the right tool](#6-forkjoin-vs-combinellatest--choosing-the-right-tool)
8. [Quick Decision Summary](#quick-decision-summary)

---

## What is an Observable?

Before diving in, a quick mental model: an **Observable** is like a stream of events over time. Think of it like a water pipe — data flows through it, and you "subscribe" to receive that data. HTTP requests in Angular return Observables that emit once (the response) and then complete.

---

## 1. `forkJoin` — Run everything in parallel, wait for all to finish

Imagine you're cooking a meal and you start the oven, the stovetop, and the microwave all at the same time. You don't serve dinner until all three are done. That's exactly `forkJoin`.

`forkJoin([obs1, obs2, obs3])` fires all Observables simultaneously, then emits a single array `[result1, result2, result3]` only after every one of them has **completed**.

### Timeline Diagram

```
obs1  ●─────────────────●(done)
      |
obs2  ●───────────────────────────●(done)
      |
obs3  ●─────────────────────────────────────●(done — slowest)
      |                                     |
      all start                    forkJoin emits [r1, r2, r3]
```

> **Key rule:** `forkJoin` only works with Observables that eventually **complete** — which is why it's perfect for HTTP requests (they fire once and finish), but not for things like `interval()` that run forever.

### Code Example

```typescript
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// All three HTTP calls fire at the same time
forkJoin([
  this.http.get('/api/user'),
  this.http.get('/api/orders'),
  this.http.get('/api/settings'),
]).subscribe(([user, orders, settings]) => {
  // This block runs ONCE — only after all three complete
  console.log(user, orders, settings);
});
```

---

## 2. Partial failure protection — `catchError` before `forkJoin`

Here's the danger: if even one Observable inside `forkJoin` throws an error, the **entire `forkJoin` fails** and you lose all results — even the successful ones.

The fix: wrap each source Observable with `catchError` before passing it to `forkJoin`. This way, if one call fails, it emits a fallback value (like `null`) and completes gracefully, allowing the others to still succeed.

### Without vs With `catchError`

```
WITHOUT catchError                   WITH catchError
──────────────────────────           ──────────────────────────────────
obs1  ──────────────── ✓             obs1  ──────────────── ✓
obs2  ──────── ✕ ERROR               obs2  ──── ✕ ~~caught→ null~~ ✓
obs3  ────────────────── ✓           obs3  ──────────────────── ✓
                                                   ↓
         ↓                           forkJoin emits [result1, null, result3]
entire forkJoin FAILS
all results lost
```

### Code Example

```typescript
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

forkJoin([
  this.http.get('/api/user').pipe(
    catchError(() => of(null))     // if this fails, emit null and complete
  ),
  this.http.get('/api/orders').pipe(
    catchError(() => of(null))
  ),
  this.http.get('/api/settings').pipe(
    catchError(() => of(null))
  ),
]).subscribe(([user, orders, settings]) => {
  // Still runs even if one call failed
  // Failed calls will have null as their value
  if (user) { /* use user data */ }
  if (orders) { /* use orders data */ }
  if (settings) { /* use settings data */ }
});
```

Each inner `catchError` catches its own failure and swaps it with `of(null)` — an Observable that emits `null` and immediately completes — so `forkJoin` always gets three completions.

---

## 3. `mergeMap` — For each item, fire a parallel HTTP call

Imagine you have a list of user IDs and you want to fetch the profile for every single one. `mergeMap` lets you do exactly that: for each item that arrives from a source Observable, it creates a new inner Observable and runs them all **simultaneously**.

Think of it like a restaurant: every table that sits down immediately gets a waiter. You don't wait for Table 1 to finish before seating Table 2.

### Timeline Diagram

```
source$   ──●──────●──────────●──────────────────────────→
           id:1   id:2       id:3

           ↓       ↓          ↓
           │       │          │
http(id:1) ●───────────────●(user 1)
           │               │
http(id:2)     ●────────────────────●(user 2)
                            │
http(id:3)           ●──────────────────●(user 3)

output$   ──────────────────●──────────●───────●──────→
                           r1         r2      r3
                   (results arrive as each call finishes — any order)
```

### Code Example

```typescript
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const userIds = [1, 2, 3, 4, 5];

from(userIds).pipe(
  mergeMap(id => this.http.get(`/api/users/${id}`))
  // All 5 HTTP calls fire in parallel
).subscribe(user => {
  // Called once for EACH user as their call completes
  console.log(user);
});
```

Results appear in the output stream **as each call completes** — not in any guaranteed order. If you need them ordered, you'd use `concatMap` instead (sequential), but that's slower.

---

## 4. `mergeMap` vs `switchMap` — The cancellation difference

This is one of the most important distinctions in RxJS. Both operators create inner Observables when a source emits, but they behave **very differently** when a new source value arrives while a previous call is still in flight.

| | `mergeMap` | `switchMap` |
|---|---|---|
| New value arrives while call is in flight | Keeps the old call running | **Cancels** the old call |
| All calls run? | Yes — all in parallel | Only the latest |
| Use when | Each call is independent | Only the latest result matters |

### Timeline Diagram

```
mergeMap (all calls run)             switchMap (cancels previous)
────────────────────────             ────────────────────────────
source$  ──●────────●──→             source$  ──●────────●──→
           A        B                           A        B

http(A)  ●────────────●(rA)          http(A)  ●────────✕ CANCELLED
http(B)          ●──────●(rB)        http(B)          ●──────●(rB)

output$  ──────────────●●──→         output$  ──────────────────●──→
                       rA rB                                    rB only
```

### Code Examples

```typescript
// mergeMap — fetch profiles for multiple users (all independent)
import { mergeMap } from 'rxjs/operators';

selectedUserIds$.pipe(
  mergeMap(id => this.http.get(`/api/users/${id}`))
).subscribe(profile => {
  this.profiles.push(profile); // every result arrives
});
```

```typescript
// switchMap — search as you type (only latest search matters)
import { switchMap, debounceTime } from 'rxjs/operators';

this.searchInput.valueChanges.pipe(
  debounceTime(300),
  switchMap(query => this.http.get(`/api/search?q=${query}`))
  // If the user types faster than 300ms, old searches are cancelled automatically
).subscribe(results => {
  this.searchResults = results; // only the latest query's results arrive
});
```

> **Rule of thumb:** If you're fetching N things for a list → `mergeMap`. If you're reacting to user input and only the latest matters → `switchMap`.

---

## 5. `combineLatest` — Re-emit whenever any source updates

`combineLatest([obs1, obs2])` combines **ongoing streams**. It holds the **latest known value** from each source and re-emits a combined array **every time any one of them emits a new value**.

Think of it like a live dashboard: you have a "current user" stream and a "current filters" stream. Whenever either one changes, `combineLatest` recalculates and re-renders the table.

**Important rule:** `combineLatest` doesn't emit anything until **every source has emitted at least once**. Until then, it doesn't know what to combine.

### Timeline Diagram

```
stream A  ──●──────────────────────●──────────────●──→
            A1                     A2             A3

stream B  ──────────●──────────────────────●──────────→
                    B1                     B2

output$   ──────────●──────────────●───────●───────●──→
                  [A1,B1]        [A2,B1] [A2,B2] [A3,B2]
          ↑
          no output here — waiting for both A and B to emit at least once
```

### Code Example

```typescript
import { combineLatest } from 'rxjs';

// Three ongoing streams
const user$ = this.store.select(selectCurrentUser);       // BehaviorSubject
const filters$ = this.store.select(selectActiveFilters);  // BehaviorSubject
const sortOrder$ = this.sortControl.valueChanges;         // FormControl stream

combineLatest([user$, filters$, sortOrder$]).subscribe(
  ([user, filters, sortOrder]) => {
    // Re-runs every time user, filters, OR sortOrder changes
    this.loadData(user.id, filters, sortOrder);
  }
);
```

---

## 6. `forkJoin` vs `combineLatest` — Choosing the right tool

This is the most common point of confusion. Here's the mental model:

**`forkJoin`** is for **one-shot work**. You have a finite set of tasks, you want to kick them all off and get a single combined result when they're all done. HTTP requests are the perfect use case.

**`combineLatest`** is for **ongoing, reactive state**. Your sources are streams that stay alive and keep emitting. You want to react to changes in any of them. Form controls, route params, and store selectors are classic examples.

### Comparison Table

| | `forkJoin` | `combineLatest` |
|---|---|---|
| **Observables must...** | Complete (finite) | Stay alive (ongoing) |
| **When it emits...** | Once, when all complete | Every time any source emits |
| **Output...** | Array of final values | Array of latest values |
| **Classic use case...** | Load 3 APIs on page init | React to form + route params |
| **Gotcha...** | One error = total failure | Won't emit until all have emitted once |

### Decision Guide

```
Are your Observables HTTP calls (or otherwise finite/completing)?
         │
         ├── YES → use forkJoin
         │           └── Worried about partial failures?
         │                   └── wrap each with catchError(() => of(null))
         │
         └── NO  → Are they ongoing streams (store selectors, form controls)?
                       └── YES → use combineLatest
```

### Side-by-side Code

```typescript
// forkJoin — page initialisation: load user + orders + settings once
ngOnInit() {
  forkJoin([
    this.http.get('/api/user').pipe(catchError(() => of(null))),
    this.http.get('/api/orders').pipe(catchError(() => of(null))),
    this.http.get('/api/settings').pipe(catchError(() => of(null))),
  ]).subscribe(([user, orders, settings]) => {
    this.user = user;
    this.orders = orders;
    this.settings = settings;
  });
}

// combineLatest — reactive table: re-load when filter OR sort changes
ngOnInit() {
  combineLatest([
    this.filterControl.valueChanges,
    this.sortControl.valueChanges,
  ]).pipe(
    switchMap(([filter, sort]) =>
      this.http.get(`/api/items?filter=${filter}&sort=${sort}`)
    )
  ).subscribe(items => {
    this.items = items;
  });
}
```

---

## Quick Decision Summary

| Operator | "I want to..." | Works with |
|---|---|---|
| `forkJoin` | Fire N HTTP calls in parallel, get all results once | Completing Observables |
| `forkJoin` + `catchError` | Same, but survive partial failures | Completing Observables |
| `mergeMap` | For each item, fire a call — all in parallel | Any Observable |
| `switchMap` | Fire a call per event, cancel if a newer one arrives | Any Observable |
| `combineLatest` | React to the latest value from N live streams | Ongoing Observables |

---

## Concepts Covered

- `forkJoin([obs1, obs2, obs3])` — fires all in parallel, emits once when ALL complete
- `forkJoin` requires all Observables to complete — works perfectly for HTTP (one-shot)
- Partial failure protection — wrap each source with `catchError` before passing to `forkJoin`
- `mergeMap(item => httpCall)` — for each item, make a call; all calls run in parallel
- `mergeMap` vs `switchMap` — mergeMap does NOT cancel, all calls run
- `combineLatest([obs1, obs2])` — re-emits when ANY source emits (for ongoing streams, not HTTP)
- When to use `forkJoin` vs `combineLatest` — HTTP vs ongoing Observables

---

*Day 05 of Angular + RxJS learning series.*