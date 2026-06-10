import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Kick off the anonymous session early. Fire-and-forget so a slow or
    // unreachable auth endpoint never blocks app startup; ensureSession() is
    // idempotent, so callers that need the id can still await it later.
    provideAppInitializer(() => {
      void inject(AuthService).ensureSession();
    }),
  ],
};
