# Day 09 — Real GitHub API + Pagination + CORS

## Goal
Replace json-server with the real GitHub REST API. Implement page-based pagination using `HttpParams`, read response headers for total count, and understand CORS — why it's a browser issue and how your Java backend fixes it.

---

## Key Steps

- Create `GitHubService` that calls GitHub REST API v3
- Build a repo search page with query input + pagination
- Use `HttpParams` to pass `q`, `page`, `per_page` as query parameters
- Read `X-Total-Count` from response headers (requires `observe: 'response'`)
- Handle 403 (rate limited) and show user-friendly message
- Store GitHub API key in `environment.ts` — never hardcode in service
- Understand CORS: browser blocks cross-origin requests unless server allows it

---

## Concepts to Explore

- `HttpParams` — build typed query string parameters immutably
- `observe: 'response'` option — get full `HttpResponse<T>` instead of just body
- `response.headers.get('X-RateLimit-Remaining')` — read response headers
- GitHub API rate limit: 60 requests/hour unauthenticated, 5000 with token
- CORS (Cross-Origin Resource Sharing) — browser policy, not Angular's problem
- `@CrossOrigin` in Spring Boot — how your Java backend enables CORS
- `HttpErrorResponse.status === 403` — GitHub rate limit response
- `HttpErrorResponse.status === 0` — network error / CORS blocked

---

## Folder / Files to Create

```
src/app/
├── core/
│   ├── models/
│   │   └── github.model.ts       ← NEW
│   └── services/
│       └── github.service.ts     ← NEW
└── features/
    └── github/
        ├── repo-search/
        │   ├── repo-search.component.ts    ← NEW
        │   └── repo-search.component.html  ← NEW
        └── repo-card/
            └── repo-card.component.ts      ← NEW
```

---

## Code

### `src/app/core/models/github.model.ts`
```typescript
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}
```

---

### `src/environments/environment.ts` (updated)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  jsonPlaceholderUrl: 'https://jsonplaceholder.typicode.com',
  githubApiUrl: 'https://api.github.com',
  // Store token here — never hardcode in service
  // For public repos: leave as '' (60 req/hr limit)
  // For higher limit: create a GitHub PAT at github.com/settings/tokens
  githubToken: ''
};
```

---

### `src/app/core/services/github.service.ts`
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { GitHubRepo, GitHubSearchResponse, PagedResult } from '../models/github.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GitHubService {
  private http = inject(HttpClient);
  private apiUrl = environment.githubApiUrl;

  private get headers(): HttpHeaders {
    const headers = new HttpHeaders({ 'Accept': 'application/vnd.github.v3+json' });

    // Add token if available (avoids 60 req/hr rate limit)
    return environment.githubToken
      ? headers.set('Authorization', `token ${environment.githubToken}`)
      : headers;
  }

  searchRepos(query: string, page = 1, perPage = 10): Observable<PagedResult<GitHubRepo>> {
    // HttpParams builds the query string immutably
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('sort', 'stars')
      .set('order', 'desc');

    return this.http.get<GitHubSearchResponse>(
      `${this.apiUrl}/search/repositories`,
      { headers: this.headers, params }
    ).pipe(
      map(response => ({
        items:      response.items,
        totalCount: response.total_count,
        currentPage: page,
        perPage:    perPage,
        totalPages: Math.ceil(response.total_count / perPage)
      })),
      catchError(err => {
        if (err.status === 403) {
          return throwError(() => new Error(
            'GitHub API rate limit exceeded. Wait 60 minutes or add a GitHub token in environment.ts'
          ));
        }
        if (err.status === 422) {
          return throwError(() => new Error('Search query is too short or invalid.'));
        }
        if (err.status === 0) {
          return throwError(() => new Error('Network error. Check your internet connection.'));
        }
        return throwError(() => new Error(`GitHub API error: ${err.message}`));
      })
    );
  }

  getReposByUser(username: string): Observable<GitHubRepo[]> {
    const params = new HttpParams()
      .set('sort', 'updated')
      .set('per_page', '10');

    return this.http.get<GitHubRepo[]>(
      `${this.apiUrl}/users/${username}/repos`,
      { headers: this.headers, params }
    );
  }
}
```

---

### `src/app/features/github/repo-search/repo-search.component.ts`
```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, of } from 'rxjs';
import { GitHubService } from '../../../core/services/github.service';
import { GitHubRepo, PagedResult } from '../../../core/models/github.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-repo-search',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './repo-search.component.html'
})
export class RepoSearchComponent {
  private githubService = inject(GitHubService);

  searchControl = new FormControl('angular');

  // Signals for state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  result = signal<PagedResult<GitHubRepo> | null>(null);
  currentPage = signal(1);

  // Computed
  repos = computed(() => this.result()?.items ?? []);
  totalPages = computed(() => this.result()?.totalPages ?? 0);
  totalCount = computed(() => this.result()?.totalCount ?? 0);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.currentPage.set(1); // reset to page 1 on new search
      }),
      switchMap(query =>
        this.githubService.searchRepos(query ?? '', 1).pipe(
          catchError(err => {
            this.errorMessage.set(err.message);
            return of(null);
          })
        )
      ),
      tap(() => this.isLoading.set(false)),
      takeUntilDestroyed()
    ).subscribe(result => {
      this.result.set(result);
    });
  }

  goToPage(page: number): void {
    const query = this.searchControl.value ?? '';
    if (!query) return;

    this.isLoading.set(true);
    this.currentPage.set(page);

    this.githubService.searchRepos(query, page).pipe(
      catchError(err => {
        this.errorMessage.set(err.message);
        return of(null);
      }),
      takeUntilDestroyed()
    ).subscribe(result => {
      this.result.set(result);
      this.isLoading.set(false);
    });
  }
}
```

---

### `src/app/features/github/repo-search/repo-search.component.html`
```html
<div class="page-container">
  <h2>GitHub Repository Search</h2>

  <input
    [formControl]="searchControl"
    placeholder="Search GitHub repos..."
    class="search-input"
  />

  <div *ngIf="errorMessage()" class="error-banner">
    ⚠️ {{ errorMessage() }}
  </div>

  <p *ngIf="isLoading()">Searching...</p>

  <div *ngIf="!isLoading() && totalCount() > 0" class="results-meta">
    {{ totalCount() | number }} repositories found
  </div>

  <div class="repo-grid" *ngIf="!isLoading()">
    <div class="repo-card" *ngFor="let repo of repos()">
      <div class="repo-header">
        <a [href]="repo.html_url" target="_blank">{{ repo.full_name }}</a>
        <span class="repo-lang" *ngIf="repo.language">{{ repo.language }}</span>
      </div>
      <p class="repo-desc">{{ repo.description || 'No description' }}</p>
      <div class="repo-stats">
        <span>⭐ {{ repo.stargazers_count | number }}</span>
        <span>🍴 {{ repo.forks_count | number }}</span>
      </div>
    </div>
  </div>

  <!-- Pagination -->
  <div class="pagination" *ngIf="totalPages() > 1">
    <button
      *ngFor="let p of [].constructor(totalPages()); let i = index"
      [class.active]="currentPage() === i + 1"
      (click)="goToPage(i + 1)">
      {{ i + 1 }}
    </button>
  </div>
</div>
```

---

## CORS Explained — What It Is and Who Fixes It

```
CORS = Cross-Origin Resource Sharing

YOUR Angular app runs on: http://localhost:4200
Your Java backend runs on: http://localhost:8080

Browser says: "These are DIFFERENT origins. I'll block this request."
              (Different port = different origin)

Who fixes it?  → The SERVER (your Java Spring Boot backend)
               → Angular CANNOT fix CORS — it's a browser security policy

In Spring Boot, add this to your controller or globally:
```

```java
// Option 1: Per controller
@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class PostController { ... }

// Option 2: Global config (recommended)
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins("http://localhost:4200", "https://your-prod-domain.com")
      .allowedMethods("GET", "POST", "PUT", "DELETE")
      .allowedHeaders("*");
  }
}
```

`status: 0` in Angular's HttpErrorResponse = CORS blocked or network unreachable.

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `HttpParams` | Build query string for GitHub search |
| Pagination with `page` + `per_page` | `searchRepos(query, page, perPage)` |
| API error codes | 403 rate limit, 422 invalid query, 0 network |
| `environment.githubToken` | Token storage without hardcoding |
| CORS explanation | Server-side fix (`@CrossOrigin` in Spring Boot) |
| Signals for page state | `currentPage`, `result`, `isLoading` |
| `takeUntilDestroyed` | Cleanup on pagination subscription |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: GitHub API integration with pagination and rate limit error handling"
```

> **Checkpoint:** Search for "angular" — repos load with pagination. Intentionally break the token to trigger 403 — a clear rate limit message should appear, not a generic error.
