import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log(`[HTTP] ▶ [${requestId}] ${req.method} ${req.url}`);

    return next(req).pipe(
        tap({
            next: (event) => {
                if (event instanceof HttpResponse) {
                    const duration = Date.now() - startTime;
                    console.log(
                        `[HTTP] ✓ [${requestId}] ${req.method} ${req.url} → ${event.status} (${duration}ms)`
                    );
                }
            },
            error: (error: HttpErrorResponse) => {
                const duration = Date.now() - startTime;;
                console.error(
                    `[HTTP] ✗ [${requestId}] ${req.method} ${req.url} → ${error.status} ${error.message} (${duration}ms)`
                );
            }
        })
    );

};
