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
