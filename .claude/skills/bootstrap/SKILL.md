# Skill — Bootstrap 5 CSS Design for DevPulse Dashboard

> This skill governs all HTML template styling in the DevPulse Angular project.
> Bootstrap 5 is installed via npm. Never use inline styles or custom CSS classes
> when a Bootstrap utility or component achieves the same result.

---

## Installation (already done — for reference)

```bash
npm install bootstrap@5.0.2
```

Register in `angular.json` under `styles` and `scripts`:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

`bootstrap.bundle.min.js` includes Popper — required for dropdowns, tooltips, modals.

---

## Core Design Rules for DevPulse

1. Every page template starts with `<div class="container-fluid px-4 py-3">` as the outer wrapper.
2. Use the 12-column grid (`row` + `col-*`) for all multi-column layouts.
3. All cards use Bootstrap's `.card` component — never custom card CSS.
4. All buttons use `.btn` + a variant class — never custom button CSS.
5. All form inputs use `.form-control` — never raw `<input>` without Bootstrap class.
6. Spacing uses Bootstrap utilities (`mt-`, `mb-`, `py-`, `px-`, `gap-`) — no custom margin/padding in CSS.
7. Colors use Bootstrap semantic classes (`text-primary`, `bg-success`, etc.) — never hardcoded hex.

---

## Layout System

### Breakpoints (memorise these)

| Breakpoint | Class prefix | Min-width |
|---|---|---|
| Extra small | `.col-` | < 576px |
| Small | `.col-sm-` | ≥ 576px |
| Medium | `.col-md-` | ≥ 768px |
| Large | `.col-lg-` | ≥ 992px |
| Extra large | `.col-xl-` | ≥ 1200px |
| Extra extra large | `.col-xxl-` | ≥ 1400px |

### Standard page layout pattern

```html
<div class="container-fluid px-4 py-3">
  <div class="row g-3">
    <div class="col-12">
      <!-- page header -->
    </div>
    <div class="col-12 col-md-8">
      <!-- main content -->
    </div>
    <div class="col-12 col-md-4">
      <!-- sidebar / secondary -->
    </div>
  </div>
</div>
```

### KPI / Dashboard card grid (Day 05)

```html
<div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
  <div class="col"><!-- kpi card --></div>
  <div class="col"><!-- kpi card --></div>
  <div class="col"><!-- kpi card --></div>
  <div class="col"><!-- kpi card --></div>
</div>
```

---

## Component Templates

### Page header with action button

```html
<div class="d-flex justify-content-between align-items-center mb-4">
  <h2 class="h4 fw-semibold mb-0">Posts</h2>
  <button class="btn btn-primary btn-sm" (click)="openCreateForm()">
    <i class="bi bi-plus-lg me-1"></i> New Post
  </button>
</div>
```

### Card (posts, users, repos)

```html
<div class="card shadow-sm border-0 h-100">
  <div class="card-body">
    <h5 class="card-title fw-semibold">{{ post.title }}</h5>
    <p class="card-text text-muted small">{{ post.body }}</p>
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-outline-secondary btn-sm" (click)="openEditForm(post)">Edit</button>
      <button class="btn btn-outline-danger btn-sm" (click)="onDelete(post.id)">Delete</button>
    </div>
  </div>
  <div class="card-footer text-muted small bg-transparent">
    User ID: {{ post.userId }}
  </div>
</div>
```

### KPI summary card (Day 05 Dashboard)

```html
<div class="card border-0 shadow-sm">
  <div class="card-body">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <p class="text-muted small mb-1 text-uppercase fw-semibold">Total Posts</p>
        <h3 class="fw-bold mb-0">{{ data.totalPosts }}</h3>
      </div>
      <div class="bg-primary bg-opacity-10 rounded-3 p-3">
        <i class="bi bi-file-text text-primary fs-4"></i>
      </div>
    </div>
  </div>
</div>
```

KPI card colour variants — use these combinations:

| Metric | Icon bg class | Icon colour | Border accent |
|---|---|---|---|
| Total Posts | `bg-primary bg-opacity-10` | `text-primary` | — |
| Total Users | `bg-info bg-opacity-10` | `text-info` | — |
| Completed Todos | `bg-success bg-opacity-10` | `text-success` | — |
| Pending Todos | `bg-warning bg-opacity-10` | `text-warning` | — |

### Form (create / edit — Day 02, Day 06)

```html
<div class="card border-0 shadow-sm mb-4">
  <div class="card-header bg-white border-bottom">
    <h5 class="mb-0 fw-semibold">{{ editPost ? 'Edit Post' : 'New Post' }}</h5>
  </div>
  <div class="card-body">

    <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="mb-3">
        <label class="form-label fw-medium">Title</label>
        <input
          formControlName="title"
          type="text"
          class="form-control"
          [class.is-invalid]="form.get('title')?.invalid && form.get('title')?.touched"
          placeholder="Enter post title"
        />
        <div class="invalid-feedback">Title is required (min 3 characters).</div>
      </div>

      <div class="mb-3">
        <label class="form-label fw-medium">Body</label>
        <textarea
          formControlName="body"
          class="form-control"
          [class.is-invalid]="form.get('body')?.invalid && form.get('body')?.touched"
          rows="4"
          placeholder="Write post content..."
        ></textarea>
        <div class="invalid-feedback">Body is required.</div>
      </div>

      <div class="d-flex gap-2 justify-content-end">
        <button type="button" class="btn btn-light" (click)="cancelled.emit()">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isLoading">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? 'Saving...' : (editPost ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>

  </div>
</div>
```

### Search bar (Day 04)

```html
<div class="input-group mb-4 shadow-sm">
  <span class="input-group-text bg-white border-end-0">
    <i class="bi bi-search text-muted"></i>
  </span>
  <input
    [formControl]="searchControl"
    type="text"
    class="form-control border-start-0"
    placeholder="Search by name or email..."
  />
  <span *ngIf="isSearching" class="input-group-text bg-white text-muted small">
    <span class="spinner-border spinner-border-sm me-1"></span> Searching...
  </span>
</div>
```

### Loading state — spinner

```html
<div class="d-flex justify-content-center align-items-center py-5" *ngIf="isLoading()">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
```

### Empty state

```html
<div class="text-center py-5 text-muted" *ngIf="!isLoading() && !hasPosts()">
  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
  <p class="mb-0">No posts yet. Create your first one.</p>
</div>
```

### Error alert (global / page-level)

```html
<div class="alert alert-danger d-flex align-items-center gap-2" role="alert" *ngIf="error()">
  <i class="bi bi-exclamation-triangle-fill"></i>
  <span>{{ error() }}</span>
</div>
```

### Navbar / Shell layout (Day 10 layout component)

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark px-4">
  <a class="navbar-brand fw-bold" routerLink="/">
    <i class="bi bi-activity me-2"></i>DevPulse
  </a>
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navMenu">
    <ul class="navbar-nav ms-auto gap-1">
      <li class="nav-item">
        <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/posts" routerLinkActive="active">Posts</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/users" routerLinkActive="active">Users</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/search" routerLinkActive="active">Search</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLink="/github" routerLinkActive="active">GitHub</a>
      </li>
    </ul>
  </div>
</nav>

<main class="container-fluid px-4 py-4">
  <router-outlet></router-outlet>
</main>
```

### Table (users list — Day 03)

```html
<div class="card border-0 shadow-sm">
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-4">Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users$ | async">
            <td class="ps-4 fw-medium">{{ user.name }}</td>
            <td class="text-muted">{{ user.email }}</td>
            <td>{{ user.city }}</td>
            <td>
              <span class="badge bg-secondary bg-opacity-10 text-secondary fw-normal">
                {{ user.company }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### Pagination (Day 09 GitHub repos)

```html
<nav aria-label="Repository pagination" class="mt-4">
  <ul class="pagination pagination-sm justify-content-center flex-wrap gap-1">
    <li class="page-item" [class.disabled]="currentPage() === 1">
      <button class="page-link" (click)="goToPage(currentPage() - 1)">
        <i class="bi bi-chevron-left"></i>
      </button>
    </li>
    <li
      class="page-item"
      *ngFor="let p of [].constructor(totalPages()); let i = index"
      [class.active]="currentPage() === i + 1">
      <button class="page-link" (click)="goToPage(i + 1)">{{ i + 1 }}</button>
    </li>
    <li class="page-item" [class.disabled]="currentPage() === totalPages()">
      <button class="page-link" (click)="goToPage(currentPage() + 1)">
        <i class="bi bi-chevron-right"></i>
      </button>
    </li>
  </ul>
</nav>
```

### GitHub repo card (Day 09)

```html
<div class="card border-0 shadow-sm h-100">
  <div class="card-body d-flex flex-column">
    <div class="d-flex justify-content-between align-items-start mb-2">
      <a [href]="repo.html_url" target="_blank"
         class="fw-semibold text-decoration-none text-dark stretched-link">
        {{ repo.full_name }}
      </a>
      <span class="badge bg-light text-secondary border ms-2 flex-shrink-0" *ngIf="repo.language">
        {{ repo.language }}
      </span>
    </div>
    <p class="text-muted small flex-grow-1">{{ repo.description || 'No description provided.' }}</p>
    <div class="d-flex gap-3 text-muted small mt-auto pt-2 border-top">
      <span><i class="bi bi-star me-1"></i>{{ repo.stargazers_count | number }}</span>
      <span><i class="bi bi-diagram-2 me-1"></i>{{ repo.forks_count | number }}</span>
    </div>
  </div>
</div>
```

### Badge variants for roles / status

```html
<!-- User role badges -->
<span class="badge rounded-pill bg-primary">admin</span>
<span class="badge rounded-pill bg-info text-dark">editor</span>
<span class="badge rounded-pill bg-secondary">viewer</span>

<!-- Todo status badges -->
<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
  Completed
</span>
<span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
  Pending
</span>
```

---

## Utility Classes — Quick Reference for DevPulse

### Spacing (used throughout)

```
mt-{0–5}   mb-{0–5}   ms-{0–5}   me-{0–5}   mx-{0–5}   my-{0–5}
pt-{0–5}   pb-{0–5}   ps-{0–5}   pe-{0–5}   px-{0–5}   py-{0–5}
gap-{0–5}  g-{0–5}    gx-{0–5}   gy-{0–5}
```

### Flexbox

```
d-flex   flex-column   flex-row   flex-wrap
justify-content-{start|end|center|between|around|evenly}
align-items-{start|end|center|baseline|stretch}
flex-grow-1   flex-shrink-0   ms-auto   me-auto
```

### Typography

```
fw-{light|normal|medium|semibold|bold}
fs-{1–6}   text-{start|center|end}
text-{muted|primary|secondary|success|danger|warning|info|dark|white}
text-uppercase   text-lowercase   text-capitalize
text-decoration-none   text-truncate
h1–h6 (as classes on any element, e.g. <p class="h4">)
```

### Display / Visibility

```
d-{none|block|inline|inline-block|flex|grid}
d-{sm|md|lg|xl}-{none|block|flex}   ← responsive show/hide
visually-hidden   ← accessible hide (screen reader only)
```

### Borders & Shadows

```
border   border-{0|top|end|bottom|start}
border-{primary|secondary|success|danger|warning|info|light|dark}
rounded   rounded-{0|1|2|3|circle|pill}
shadow-{none|sm|—|lg}
```

### Backgrounds

```
bg-{primary|secondary|success|danger|warning|info|light|dark|white|transparent}
bg-opacity-{10|25|50|75|100}   ← combine with bg-* for tints
```

### Sizing

```
w-{25|50|75|100|auto}   h-{25|50|75|100|auto}
min-vw-100   min-vh-100   vw-100   vh-100
```

---

## Bootstrap Icons (bi-*)

Install separately:

```bash
npm install bootstrap-icons
```

Add to `angular.json` styles:

```json
"node_modules/bootstrap-icons/font/bootstrap-icons.css"
```

### Icons used across DevPulse components

| Context | Icon class |
|---|---|
| New / Add | `bi bi-plus-lg` |
| Edit | `bi bi-pencil` |
| Delete | `bi bi-trash` |
| Search | `bi bi-search` |
| Dashboard | `bi bi-speedometer2` |
| Posts | `bi bi-file-text` |
| Users | `bi bi-people` |
| GitHub | `bi bi-github` |
| Settings | `bi bi-gear` |
| Error / Warning | `bi bi-exclamation-triangle-fill` |
| Empty inbox | `bi bi-inbox` |
| Stars | `bi bi-star` |
| Forks | `bi bi-diagram-2` |
| Chevron left/right | `bi bi-chevron-left` / `bi bi-chevron-right` |
| App brand | `bi bi-activity` |

---

## Rules Claude Code Must Follow

1. **Never write custom CSS** for layout, spacing, colour, or typography when a Bootstrap utility exists.
2. **Always use `is-invalid` + `invalid-feedback`** for reactive form validation display — not custom error `<span>` elements.
3. **Always use `spinner-border`** for loading states — not custom spinners.
4. **Always use `alert alert-{variant}`** for error and success messages — not custom banners.
5. **All buttons must have a size modifier** (`btn-sm` or `btn-lg`) — never bare `btn btn-primary` alone.
6. **Cards must include `border-0 shadow-sm`** — Bootstrap's default card border is too heavy for a dashboard UI.
7. **Responsive grid first** — every `col-*` class should have a mobile default (`col-12`) before adding breakpoint variants.
8. **`d-flex gap-{n}`** for button groups and inline action rows — never `margin-right` on individual buttons.
9. **`table-responsive` wrapper** on every `<table>` — prevents horizontal overflow on small screens.
10. **`visually-hidden`** on spinner text for accessibility — never omit it.
