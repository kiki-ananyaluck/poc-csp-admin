import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'admin',

  exposes: {
    // Expose routes สำหรับ Server-Side Rendering
    './Routes': 'apps/admin/src/app/remote-entry/entry.routes.ts',
  },

  // Shared dependencies สำหรับ Server - MUST match client config
  shared: (libraryName, defaultConfig) => {
    // Critical: Share rxjs
    if (libraryName === 'rxjs' || libraryName.startsWith('rxjs/')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Critical: Share zone.js
    if (libraryName === 'zone.js') {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Share @ant-design/icons-angular
    if (libraryName.startsWith('@ant-design/icons-angular')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Share ng-zorro-antd
    if (libraryName.startsWith('ng-zorro-antd')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Share @angular/cdk
    if (libraryName.startsWith('@angular/cdk')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Share @exim/ui-kit
    if (libraryName === '@exim/ui-kit') {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    // Share @exim/auth-sdk — MUST be singleton so remote reuses shell's AuthService instance
    if (libraryName === '@exim/auth-sdk') {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
        eager: false,
      };
    }

    // Angular core libraries
    if (libraryName.startsWith('@angular/')) {
      return {
        ...defaultConfig,
        singleton: true,
        strictVersion: false,
        eager: true,
      };
    }

    return defaultConfig;
  },
};

export default config;
