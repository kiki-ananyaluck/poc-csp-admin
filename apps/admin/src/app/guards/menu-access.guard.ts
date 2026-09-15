import { inject } from '@angular/core';
import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { AuthUserService } from '@exim/auth-sdk';
import { APP_ROUTE_PATHS } from '../app.routes.const';

interface AuthMenuItem {
  path: string;
  children: AuthMenuItem[] | null;
}

interface AuthSubAppItem {
  appId?: string | null;
  appCode?: string | null;
  appName?: string | null;
}

const ALWAYS_ALLOWED_PATHS = new Set<string>([
  '/',
  APP_ROUTE_PATHS.HOME,
  APP_ROUTE_PATHS.FORBIDDEN,
]);

function normalizePath(path: string): string {
  const pathWithoutQuery = path.split('?')[0]?.split('#')[0] ?? '';
  if (!pathWithoutQuery) {
    return '/';
  }

  const withLeadingSlash = pathWithoutQuery.startsWith('/')
    ? pathWithoutQuery
    : `/${pathWithoutQuery}`;

  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

function flattenMenuPaths(menus: AuthMenuItem[]): string[] {
  const paths: string[] = [];

  const visit = (items: AuthMenuItem[]): void => {
    for (const item of items) {
      const menuPath = normalizePath(item.path ?? '');
      if (menuPath !== '/') {
        paths.push(menuPath);
      }

      if (Array.isArray(item.children) && item.children.length > 0) {
        visit(item.children);
      }
    }
  };

  visit(menus);
  return Array.from(new Set(paths));
}

function isAllowedByMenuPath(targetPath: string, menuPaths: string[]): boolean {
  return menuPaths.some((menuPath) => {
    if (targetPath === menuPath) {
      return true;
    }

    return targetPath.startsWith(`${menuPath}/`);
  });
}

function isAllowedBySubApp(
  targetPath: string,
  subApps: AuthSubAppItem[],
): boolean {
  const loweredPath = targetPath.toLowerCase();

  return subApps.some((subApp) => {
    const keys = [subApp.appCode, subApp.appId, subApp.appName]
      .map((value) => value?.trim().toLowerCase() ?? '')
      .filter((value) => value.length > 0);

    return keys.some(
      (key) =>
        loweredPath === `/${key}` ||
        loweredPath.includes(`/${key}/`) ||
        loweredPath.endsWith(`/${key}`),
    );
  });
}

export const menuAccessGuard: CanActivateChildFn = (_route, state) => {
  const authUserService = inject(AuthUserService);
  const router = inject(Router);

  const targetPath = normalizePath(state.url);

  if (ALWAYS_ALLOWED_PATHS.has(targetPath)) {
    return true;
  }

  const menus = (authUserService.menus() ?? []) as AuthMenuItem[];
  const subApps = (authUserService.subAppList() ?? []) as AuthSubAppItem[];

  // Do not block on initial app boot when profile sync is still pending.
  if (menus.length === 0 && subApps.length === 0) {
    return true;
  }

  const menuPaths = flattenMenuPaths(menus);

  if (isAllowedByMenuPath(targetPath, menuPaths)) {
    return true;
  }

  if (isAllowedBySubApp(targetPath, subApps)) {
    return true;
  }

  return router.createUrlTree([APP_ROUTE_PATHS.FORBIDDEN]) as UrlTree;
};
