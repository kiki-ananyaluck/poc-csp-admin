import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  InjectionToken,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { gatewayCredentialsInterceptor } from './interceptors/gateway-credentials.interceptor';
import { firstValueFrom } from 'rxjs';
import { AUTH_SDK_CONFIG, AuthService, AuthUserService } from '@exim/auth-sdk';
import { environment } from '@environments/environments';
import { NzIconModule, provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from './app.icon';
import { provideNzI18n, th_TH } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import th from '@angular/common/locales/th';
import {
  provideRealtimeSignalRTransport,
  provideUtilSdk,
  SignalRTransport,
} from '@exim/util-sdk';
import { provideOnboarding } from '@exim/onboarding';

export const ADMIN_ROUTE_PREFIX = new InjectionToken<string>(
  'ADMIN_ROUTE_PREFIX',
);

// Register Thai locale
registerLocaleData(th);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(NzIconModule),
    provideNzIcons(icons),
    provideNzI18n(th_TH),
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([gatewayCredentialsInterceptor]),
    ),
    { provide: AUTH_SDK_CONFIG, useValue: environment },
    { provide: ADMIN_ROUTE_PREFIX, useValue: '' },
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const authUserService = inject(AuthUserService);

      return Promise.all([
        firstValueFrom(authService.syncUserProfile()),
        firstValueFrom(
          authUserService.syncEmployeeInfoAndPerm(environment.srm.appId),
        ),
        console.log(
          '[AppInit] getEmployeeInfo signal:',
          authUserService.getEmployeeInfo(),
        ),
      ]);
    }),
    provideUtilSdk({
      realtime: {
        defaultClient: 'notify',
        clients: {
          notify: {
            transport: 'signalr',
            signalRTransport: SignalRTransport.WebSockets,
            url: `${environment.wssPath.baseDomain}/${environment.wssPath.notificationHubUrl}`,
          },
        },
      },
    }),
    provideRealtimeSignalRTransport(),
    // Onboarding lib (admin-view ดูใบสมัคร) — ใช้ค่า default FX_LABELS_TH
    provideOnboarding({
      apiBaseUrl: environment.servicePaths.baseDomain,
      paths: {
        userService: environment.servicePaths.user,
        thirdParty: environment.servicePaths.thirdParty,
        centralized: environment.servicePaths.centralized,
      },
      stepRegistry: {},
      otpLength: 8,
      termsApplicationCode: 'superapp',
    }),
  ],
};
