# Day 07 — HTTP Interceptors (Auth + Logging)

## Goal
Intercept every outgoing HTTP request and incoming response at a central point — without touching individual services. Build an Auth interceptor that adds a token header, and a Logging interceptor that measures response time.

---

## Key Steps

- Understand what interceptors are — the middleware layer of Angular HTTP
- Create `AuthInterceptor` (functional style — Angular 15+) that appends a fake Bearer token
- Create `LoggingInterceptor` that logs request URL, method, and response time
- Register both interceptors in `app.config.ts` via `withInterceptors([])`
- Understand `HttpRequest` is immutable — you must `.clone()` to modify it
- Handle 401 Unauthorized globally — log and show error, no per-service handling needed

---

## Concepts to Explore

- Functional interceptor signature: `(req, next) => Observable<HttpEvent<unknown>>`
- `req.clone({ headers: req.headers.set(key, value) })` — immutable request modification
- `next(clonedReq)` — pass modified request forward through the chain
- `pipe()` on `next(req)` — intercept the response stream too
- `tap()` on response to log — response is an `HttpEvent`, check for `HttpResponse` type
- Interceptor order matters — they run in the order registered
- `HttpErrorResponse` — typed error object with `status`, `message`, `url`
- `retry(2)` inside interceptor — automatically retry failed requests twice before erroring

---

## Folder / Files to Create

```
src/app/
└── core/
    └── interceptors/
        ├── auth.interceptor.ts       ← NEW
        └── logging.interceptor.ts    ← NEW
└── app.config.ts                     ← EDIT (register interceptors)
```

---

## Code

### `src/app/core/interceptors/auth.interceptor.ts`
```typescript
import { HttpInterceptorFn } from '@angular/common/http';

// Simulates reading a token from localStorage (Day 8 will use a signal for this)
function getToken(): string {
  return localStorage.getItem('auth_token') ?? 'fake-jwt-token-for-demo';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't attach token to external public APIs (GitHub, JSONPlaceholder)
  const isInternalApi = req.url.includes('localhost:3000');

  if (!isInternalApi) {
    return next(req); // pass through unchanged
  }

  // HttpRequest is immutable — must clone to modify
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${getToken()}`)
  });

  return next(authReq);
};
```

---

### `src/app/core/interceptors/logging.interceptor.ts`
```typescript
import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8).toUpperCase();

  console.log(`[HTTP] ▶ [${requestId}] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => {
        // event is HttpEvent — only log on final HttpResponse (not upload progress etc.)
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          console.log(
            `[HTTP] ✓ [${requestId}] ${req.method} ${req.url} → ${event.status} (${duration}ms)`
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;
        console.error(
          `[HTTP] ✗ [${requestId}] ${req.method} ${req.url} → ${error.status} ${error.message} (${duration}ms)`
        );
      }
    })
  );
};
```

---

### Global Error Interceptor (bonus — add inside logging or separate)
```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired — could trigger logout or token refresh here
        console.warn('[ErrorInterceptor] 401 Unauthorized — token may have expired');
      }

      if (error.status === 0) {
        // Network error — server unreachable
        console.error('[ErrorInterceptor] Network error — is json-server running?');
      }

      // Rethrow so individual services/components can still handle if needed
      return throwError(() => error);
    })
  );
};
```

---

### `src/app/app.config.ts` (updated — register interceptors)
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        loggingInterceptor,   // runs first — wraps entire request
        authInterceptor,      // adds token to outgoing request
        errorInterceptor      // catches errors on response
      ])
    )
  ]
};
```

---

## How the Interceptor Chain Works

```
Outgoing Request Flow (top to bottom):
─────────────────────────────────────────
  Component/Service calls http.get(url)
         ↓
  loggingInterceptor  → logs "▶ GET /posts", starts timer
         ↓
  authInterceptor     → clones request, adds Authorization header
         ↓
  errorInterceptor    → passes through on way out
         ↓
  Actual HTTP request sent to server

Incoming Response Flow (bottom to top):
─────────────────────────────────────────
  Server responds
         ↓
  errorInterceptor    → checks status, handles 401/0 errors
         ↓
  authInterceptor     → passes through on way back
         ↓
  loggingInterceptor  → logs "✓ 200 (42ms)"
         ↓
  Observable in service/component receives response
```

---

## Concepts Covered

| Concept | Where Used |
|---|---|
| `HttpInterceptorFn` | Functional interceptor signature |
| `req.clone()` | Immutable request modification in `authInterceptor` |
| `next(clonedReq)` | Pass modified request through the chain |
| `tap()` on response stream | Log response details in `loggingInterceptor` |
| `HttpResponse` type check | Filter out non-final events |
| `catchError` in interceptor | Global 401/network error handling |
| `withInterceptors([])` | Register interceptors in `provideHttpClient` |
| Interceptor order | Logging wraps everything; auth adds headers; error handles response |

---

## GitHub Commit Goal

```bash
git add .
git commit -m "feat: auth + logging + global error interceptors"
```

> **Checkpoint:** Open browser console → navigate to Posts page. You should see `[HTTP] ▶ GET http://localhost:3000/posts` and `[HTTP] ✓ 200 (42ms)` logs. Open Network tab and confirm `Authorization: Bearer fake-jwt-token-for-demo` header is on json-server requests.
