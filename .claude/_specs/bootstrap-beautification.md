# Spec for bootstrap-beautification

branch: chore/bootstrap-beautification

## Summary
- Add Bootstrap 5 visual styling to the Day 01–02 implementation without touching any TypeScript logic
- Bootstrap 5.0.2 and Bootstrap Icons 1.13.1 are already installed as npm dependencies — no new packages needed
- All changes are limited to: `styles.css`, HTML templates, and CSS files for existing components
- No `.ts` files, routing, services, models, or app config are to be modified

## Functional Requirements
- Import Bootstrap CSS and Bootstrap Icons from `node_modules` in `src/styles.css`
- Add a responsive Bootstrap navbar to `src/app/app.html` (brand + nav link to `/posts`)
- Wrap the app in a Bootstrap `container` via the global layout
- Style `post-list.html`:
  - Page title with a "New Post" button aligned right using `d-flex justify-content-between`
  - Each post rendered as a Bootstrap `card` with `card-title`, `card-text`, `card-footer`
  - Edit button as `btn btn-outline-primary btn-sm`, Delete as `btn btn-outline-danger btn-sm`
  - Inline form area visually separated with a `card bg-light` wrapper
- Style `post-form.html`:
  - Each field wrapped in `mb-3` with `form-label` + `form-control`
  - Textarea uses `form-control`
  - Validation errors shown with Bootstrap `invalid-feedback` pattern (`.text-danger.small`)
  - Submit button as `btn btn-primary`, Cancel as `btn btn-secondary`
  - Loading state disables submit button with a Bootstrap spinner inline
- Flesh out `loading-spinner.html` with a Bootstrap `spinner-border` (centered, medium size)
- Flesh out `error-banner.html` with a Bootstrap `alert alert-danger` with dismiss button
- Add minimal scoped CSS to component `.css` files only where Bootstrap utilities alone are insufficient (e.g. card hover shadow, spinner centering)

## Possible Edge Cases
- Bootstrap imported via `node_modules` path must match the installed version path exactly (`bootstrap/dist/css/bootstrap.min.css`)
- Bootstrap Icons path: `bootstrap-icons/font/bootstrap-icons.css`
- The inline form area in `post-list.html` is toggled via `@if` — the Bootstrap wrapper must not break the Angular control flow
- The `post-form` submit button has a dynamic `[disabled]` binding and dynamic label — Bootstrap classes must not interfere with that binding
- `error-banner` component receives no `@Input()` yet — the Bootstrap alert should render static placeholder content that will be wired up in a future day

## Acceptance Criteria
- `npm start` compiles without errors after changes
- `http://localhost:4200/posts` shows a styled navbar, post cards in a grid-responsive layout, and a styled "New Post" button
- Clicking "New Post" reveals a styled Bootstrap form
- Loading spinner shows a centred Bootstrap spinner
- Error banner renders as a red Bootstrap alert
- No `.ts` files have been modified
- No logical behaviour has changed — all existing Angular bindings, outputs, and validations still work

## Open Questions
- None — Bootstrap is already installed, scope is purely cosmetic

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- `post-list` renders with Bootstrap card classes present in the DOM
- `post-form` renders with `form-control` class on inputs
- `loading-spinner` renders the `spinner-border` element
- `error-banner` renders an element with `alert alert-danger` classes
