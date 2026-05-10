# Plan: Bootstrap Beautification (Day 01–02)

> Spec: `.claude/_specs/bootstrap-beautification.md`
> Branch: `chore/bootstrap-beautification`
> Constraint: **No `.ts` files modified. No logical code changed.**

---

## Context

Days 01–02 produced a fully working Angular app (PostList + PostForm with CRUD) but with zero visual styling — all CSS files are empty and Bootstrap 5.0.2 (+ Bootstrap Icons 1.13.1) is already installed as an npm dependency but never imported. This plan adds Bootstrap cosmetic styling only: import, layout shell, card list, form styling, and fleshing out the two shared stub components.

---

## Files to Change

| File | Change |
|------|--------|
| `src/styles.css` | Import Bootstrap CSS + Bootstrap Icons from `node_modules` |
| `src/app/app.html` | Add Bootstrap navbar wrapping `<router-outlet>` |
| `src/app/app.css` | No change needed |
| `src/app/features/posts/post-list/post-list.html` | Apply Bootstrap layout, card, and button classes |
| `src/app/features/posts/post-list/post-list.css` | Scoped card hover + spacing tweaks |
| `src/app/features/posts/post-form/post-form.html` | Apply Bootstrap form-control, btn, validation classes |
| `src/app/features/posts/post-form/post-form.css` | Scoped form-container padding |
| `src/app/shared/components/loading-spinner/loading-spinner.html` | Replace stub with Bootstrap `spinner-border` |
| `src/app/shared/components/loading-spinner/loading-spinner.css` | Center spinner |
| `src/app/shared/components/error-banner/error-banner.html` | Replace stub with Bootstrap `alert alert-danger` |
| `src/app/shared/components/error-banner/error-banner.css` | No change needed |

---

## Step-by-Step Implementation

### Step 1 — Import Bootstrap in `src/styles.css`
```css
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';
```
This activates Bootstrap globally. Both packages are already in `node_modules`.

---

### Step 2 — App shell navbar (`src/app/app.html`)
Add a `navbar navbar-expand-lg navbar-dark bg-dark` bar with the brand "DevPulse" and a "Posts" nav link pointing to `/posts`. Keep `<router-outlet>` inside a `<main class="container py-4">` wrapper for consistent page padding.

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand fw-bold" routerLink="/posts">
      <i class="bi bi-activity me-2"></i>DevPulse
    </a>
    <div class="navbar-nav">
      <a class="nav-link" routerLink="/posts" routerLinkActive="active">Posts</a>
    </div>
  </div>
</nav>
<main class="container py-4">
  <router-outlet></router-outlet>
</main>
```
> Requires adding `RouterLink`, `RouterLinkActive` to `app.ts` imports — but `app.ts` already imports `RouterOutlet`; need to check if RouterLink is available. If `app.ts` cannot be touched, use plain `<a href="/posts">` instead.

**Safe fallback (no .ts change):** Use `href="/posts"` for nav links, keep `<router-outlet>` as-is.

---

### Step 3 — Post list template (`post-list.html`)

- Wrap page in nothing (container already applied by `app.html`)
- Page header: `<div class="d-flex justify-content-between align-items-center mb-4">`
  - Title: `<h2 class="mb-0">Posts</h2>`
  - Button: `<button class="btn btn-primary"> <i class="bi bi-plus-lg me-1"></i> New Post </button>`
- Error area: replace `.error-banner` div with `<div class="alert alert-danger">`
- Inline form wrapper: `<div class="card bg-light border-0 shadow-sm mb-4 p-3">`
- Posts grid: `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">`
  - Each post: `<div class="col"><div class="card h-100 shadow-sm">`
    - `card-body` with `card-title` (h5) and `card-text`
    - `card-footer` with edit/delete buttons:
      - Edit: `btn btn-outline-primary btn-sm`
      - Delete: `btn btn-outline-danger btn-sm`
- Empty state (`@empty`): `<p class="text-muted fst-italic mt-3">No posts available.</p>`
- Loading state (`@else`): `<app-loading-spinner>`

---

### Step 4 — Post list CSS (`post-list.css`)
```css
.card {
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}
```

---

### Step 5 — Post form template (`post-form.html`)

- Outer wrapper: `<div class="p-2">`
- Form heading: `<h5 class="mb-3">{{ editPost ? 'Edit Post' : 'New Post' }}</h5>`
- Each field: `<div class="mb-3">` with `<label class="form-label">` + `<input class="form-control">`
- Textarea: `<textarea class="form-control" rows="4">`
- Validation errors: `<div class="text-danger small mt-1">`
- Top-level error banner: `<div class="alert alert-danger alert-sm mb-3">`
- Actions row: `<div class="d-flex gap-2 justify-content-end">`
  - Cancel: `<button type="button" class="btn btn-secondary">`
  - Submit: `<button type="submit" class="btn btn-primary">` with inline spinner when loading:
    ```html
    @if (isSubmitting) {
      <span class="spinner-border spinner-border-sm me-1"></span>
    }
    ```

---

### Step 6 — Post form CSS (`post-form.css`)
```css
h5 {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}
```

---

### Step 7 — Loading spinner (`loading-spinner.html`)
Replace the stub `<p>` with:
```html
<div class="d-flex justify-content-center py-5">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
```

---

### Step 8 — Loading spinner CSS (`loading-spinner.css`)
No changes needed — Bootstrap utilities handle layout.

---

### Step 9 — Error banner (`error-banner.html`)
Replace the stub `<p>` with:
```html
<div class="alert alert-danger d-flex align-items-center" role="alert">
  <i class="bi bi-exclamation-triangle-fill me-2"></i>
  <span>Something went wrong. Please try again.</span>
</div>
```

---

## Verification

1. Run `npm start` — confirm zero compile errors
2. Open `http://localhost:4200/posts` — verify:
   - Dark navbar with DevPulse brand and Posts link
   - Posts render as Bootstrap cards in a responsive grid
   - "+ New Post" button opens the inline form
   - Form has Bootstrap input styling and validation colours
   - Delete/Edit buttons are styled correctly
3. Temporarily remove a required form field — verify red validation text appears
4. Confirm no `.ts` files have been modified (`git diff --name-only | grep '\.ts$'` returns empty)

---

## Out of Scope
- Wiring `@Input()` on `ErrorBanner` — stays as static placeholder (future day)
- Any change to routing, services, models, interceptors, or environment files
- Adding Bootstrap JS / Popper (no dropdowns or modals needed yet)
