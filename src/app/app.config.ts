import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth-interceptors';
import { loggingInterceptor } from './core/interceptors/logging-interceptor';
import { errorInterceptor } from './core/interceptors/global-error-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      // We will active the inteceptor lillle later
      // withInterceptors([
        // loggingInterceptor,   // runs first — wraps entire request
        //authInterceptor,      // adds token to outgoing request
       // errorInterceptor      // catches errors on response
      // ]),
      withFetch()
    ),
    provideClientHydration(withEventReplay())
  ]
};
