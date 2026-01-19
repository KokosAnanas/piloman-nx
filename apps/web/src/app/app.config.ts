/**
 * Конфигурация Angular приложения piloman.ru
 *
 * @see https://angular.dev/guide/standalone-components — Standalone Components
 * @see https://angular.dev/guide/http — HttpClient
 * @see https://primeng.org/installation — PrimeNG v21
 */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// PrimeNG v21
// @see https://primeng.org/installation
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    /**
     * Router provider
     * @see https://angular.dev/guide/routing
     */
    provideRouter(appRoutes),

    /**
     * HttpClient provider
     * withFetch() использует Fetch API вместо XMLHttpRequest (рекомендуется)
     *
     * @see https://angular.dev/guide/http#configuring-http-features
     */
    provideHttpClient(withFetch()),

    /**
     * Animations (required for PrimeNG)
     * provideAnimationsAsync() — ленивая загрузка анимаций
     *
     * @see https://angular.dev/guide/animations
     */
    provideAnimationsAsync(),

    /**
     * PrimeNG v21 Configuration
     * Aura — современная тема PrimeNG
     *
     * @see https://primeng.org/theming
     * @see https://primeng.org/configuration
     */
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
