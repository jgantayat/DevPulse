---
description: Sync with remote main, create a feature branch, analyze changes, and raise a pull request with a reviewed commit message and PR description. Tailored for the DevPulse Dashboard — Angular 17+ / HttpClient / RxJS / Signals learning project.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git fetch:*), Bash(git pull:*), Bash(git checkout:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(gh pr create:*), Bash(gh pr view:*)
---

## Run these commands first:

```
git status
git fetch origin
git diff HEAD origin/main --stat
```

## Your task:

Execute a full Git workflow — from syncing local `main` with remote all the way to opening a Pull Request. Follow every step **in order** and **never skip the approval gates**.

---

## Step 1 — Sync local `main` with remote

```
git checkout main
git pull origin main
```

Confirm local `main` is up to date before proceeding.

---

## Step 2 — Create a new feature branch

Derive a short, kebab-case branch name from the observed changes. Use the day prefix where applicable (e.g. `day-04/live-search-switchmap`, `fix/day-06-exhaustmap-double-submit`, `chore/learning-log-day-03`).

```
git checkout -b <branch-name>
```

State the branch name chosen and the reasoning behind it.

### Branch naming conventions for DevPulse:

| Prefix | When to use |
|--------|-------------|
| `day-NN/` | Primary day implementation (e.g. `day-07/http-interceptors`) |
| `feat/` | A standalone feature added outside a specific day's scope |
| `fix/` | Bug fix in existing day code |
| `refactor/` | Reworking a prior day's implementation |
| `chore/` | LEARNING_LOG, README, config, `db.json`, environment files |
| `perf/` | Lazy loading, bundle optimisation |

---

## Step 3 — Analyze the changes

```
git status
git diff
git diff --staged
```

Produce a structured summary:

| Category | Details |
|----------|---------|
| **New files** | List newly created files (models, services, components, interceptors) |
| **Modified files** | List changed files and what specifically changed |
| **Deleted files** | List any removed files |
| **Day scope** | Which day(s) of the 10-day plan does this commit cover? |
| **Concepts introduced** | List the Angular/RxJS/Signals concepts touched (e.g. `switchMap`, `takeUntilDestroyed`, `signal.update()`) |
| **Key context** | Explain the *why* — what feature, pattern, or fix do these changes represent? |

---

## Step 4 — Stage all changes

```
git add .
```

---

## Step 5 — Propose the commit message (APPROVAL GATE 1)

Using the diff analysis from Step 3, compose a commit message following the format below.

### Commit types with emojis:

Only use the following emojis:

* ✨ `feat:` — New feature or day implementation
* 🐛 `fix:` — Bug fix
* 🔨 `refactor:` — Reworking existing code
* 📝 `docs:` — LEARNING_LOG, README, inline comments
* 🎨 `style:` — CSS / template formatting only
* ✅ `test:` — Tests
* ⚡ `perf:` — Lazy loading, bundle size, preloading strategy
* 🔧 `chore:` — Config, environment files, `db.json`, tooling

### Format:

```
<emoji> <type>[day-NN]: <concise_description>

<optional body — present tense, explain WHY not just WHAT>
<list Angular/RxJS concepts introduced if this is a day implementation>
```

### Examples for DevPulse:

```
✨ feat[day-04]: add live search with switchMap + debounce

Replaces naive per-keystroke fetching with a debounced, cancellation-safe
pipeline. switchMap ensures only the latest query's request survives —
previous in-flight requests are cancelled automatically.
Concepts: switchMap, debounceTime, distinctUntilChanged, startWith
```

```
🔨 refactor[day-08]: replace manual posts$ Observable with signal-based state

Eliminates repeated getAll() calls on every CRUD operation. Posts are now
stored in a private writable signal; components read from asReadonly() signals.
Optimistic updates via signal.update() remove the need for follow-up GETs.
Concepts: signal, computed, effect, signal.update(), asReadonly()
```

```
📝 docs: fill LEARNING_LOG entries for days 01–03

Added personal reflections covering Observable mental model, async pipe vs
manual subscribe, and catchError stream recovery behaviour.
```

> ⛔ **STOP — Do NOT commit yet.**
> Present the proposed commit message and ask:
> *"Does this commit message look good? Reply **yes** to commit, or suggest changes."*

Only proceed to Step 6 after explicit approval.

---

## Step 6 — Commit and push

```
git commit -m "<approved commit message>"
git push origin <branch-name>
```

---

## Step 7 — Propose the Pull Request (APPROVAL GATE 2)

Compose a PR using the structure below.

### PR format:

```
Title: <emoji> <type>[day-NN]: <same concise description as commit>

## Summary
<1–3 sentences: what this PR implements and why it matters in the learning arc>

## Day scope
<!-- Which day(s) of the 10-day roadmap does this cover? -->
- [ ] Day 01 — Setup + first GET
- [ ] Day 02 — CRUD + typed responses
- [ ] Day 03 — map, tap, filter, catchError
- [ ] Day 04 — switchMap + debounceTime
- [ ] Day 05 — forkJoin + mergeMap
- [ ] Day 06 — exhaustMap + takeUntilDestroyed
- [ ] Day 07 — HTTP interceptors
- [ ] Day 08 — Signals + BehaviorSubject
- [ ] Day 09 — GitHub API + pagination
- [ ] Day 10 — Lazy loading + deploy

## Changes
- <new file or modified file — what changed and why>
- <...>

## Angular / RxJS concepts introduced
<!-- List operators, APIs, or patterns this PR adds for the first time -->
- 

## Type of change
- [ ] ✨ Day implementation (new feature)
- [ ] 🐛 Bug fix
- [ ] 🔨 Refactor of prior day
- [ ] 📝 Docs / LEARNING_LOG / README
- [ ] 🎨 Style / template formatting
- [ ] ⚡ Performance / lazy loading
- [ ] 🔧 Config / tooling / environment

## Checkpoint verification
<!-- Describe the manual check from the day's checkpoint section -->
<e.g. "Opened /search, typed quickly — Network tab shows cancelled requests.
Only the last request completes with 200.">

## Subscription hygiene
- [ ] All new subscriptions use `async pipe` OR `takeUntilDestroyed()`
- [ ] No manual `.subscribe()` without cleanup
- [ ] No hardcoded API URLs (all via `environment.ts`)

## Notes for reviewer
<Any context, caveats, known issues, or areas to pay special attention to>
```

> ⛔ **STOP — Do NOT create the PR yet.**
> Present the full PR title and description and ask:
> *"Does this Pull Request description look good? Reply **yes** to create the PR, or suggest changes."*

Only proceed to Step 8 after explicit approval.

---

## Step 8 — Create the Pull Request

```
gh pr create \
  --base main \
  --head <branch-name> \
  --title "<approved PR title>" \
  --body "<approved PR body>"
```

Then run:

```
gh pr view
```

Display the PR URL to the user.

---

## Output summary

After all steps complete, show this recap:

| Step | Status |
|------|--------|
| Synced local `main` with remote | ✅ |
| Created feature branch | ✅ `<branch-name>` |
| Analyzed and staged changes | ✅ |
| Day scope identified | ✅ `Day NN — <topic>` |
| Commit message approved & committed | ✅ |
| Pushed branch to remote | ✅ |
| PR description approved & PR created | ✅ |
| PR URL | `<url>` |

---

## Rules

* **Never auto-commit** — always wait for user approval at Gate 1.
* **Never auto-create a PR** — always wait for user approval at Gate 2.
* Use **present tense** in all commit and PR text.
* Always identify which day of the 10-day plan the commit belongs to.
* Always list Angular/RxJS/Signals concepts introduced in the commit body.
* The `Subscription hygiene` checklist in the PR must be filled before submission.
* If `gh` CLI is not authenticated, alert the user: *"Run `gh auth login` first, then re-run this command."*

