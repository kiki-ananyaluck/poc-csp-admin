import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LayoutComponent, MenuItemConfig } from '@exim/ui-kit';
import { UserProfilePanelMenuItem } from '@exim/ui-kit';
import { AuthUserService } from '@exim/auth-sdk';
import { LogoutConfirmModalComponent } from '@components/modals/logout-confirm-modal/logout-confirm-modal';
import { LogoutConfirmState } from '@components/modals/logout-confirm-modal/logout-confirm-modal.state';
import { NotificationPanelState } from '@components/panels/notification-panel/notification-panel.state';
import { UserProfilePanelState } from '@components/panels/user-profile-panel/user-profile-panel.state';
import {
  NotificationFilter,
  NotificationItem,
} from '@services/notification/notification.models';
import { RealtimeAppConnectionService } from '@services/realtime/realtime-app-connection.service';
import { ADMIN_PORTAL_BOTTOM_MENU } from './admin-portal-layout.config';
import { APP_ROUTE_PATHS } from '../../app.routes.const';

@Component({
  selector: 'app-admin-portal-layout',
  imports: [RouterModule, LayoutComponent, LogoutConfirmModalComponent],
  providers: [NotificationPanelState, UserProfilePanelState],
  templateUrl: './admin-portal-layout.html',
  styleUrl: './admin-portal-layout.scss',
})
export class AdminPortalLayout implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly realtimeAppConnectionService = inject(
    RealtimeAppConnectionService,
  );
  private readonly logoutConfirmState = inject(LogoutConfirmState);
  private readonly notifState = inject(NotificationPanelState);
  private readonly userState = inject(UserProfilePanelState);
  private readonly authUserService = inject(AuthUserService);

  readonly menuItems = computed<MenuItemConfig[]>(() =>
    this.toMenuItemConfigs(this.authUserService.menus()),
  );
  readonly bottomMenuItems: MenuItemConfig[] = ADMIN_PORTAL_BOTTOM_MENU;
  private readonly routeTitleMap = computed(() =>
    this.createRouteTitleMap(this.menuItems()),
  );

  // User panel data
  readonly userName = this.userState.displayName;
  readonly userEmail = this.userState.email;
  readonly avatarUrl = this.userState.avatarUrl;
  readonly userMenuItems: UserProfilePanelMenuItem[] = [
    { label: 'ออกจากระบบ', icon: 'logout', action: 'logout' },
  ];

  // Notification panel data
  readonly unreadCount = this.realtimeAppConnectionService.unreadCount;
  readonly notifications = this.notifState.items;
  readonly notificationsLoading = this.notifState.isLoading;
  readonly activeNotificationTab = this.notifState.activeTab;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => setTimeout(() => this.syncSidebarActive(e.url)));
  }

  ngAfterViewInit(): void {
    this.syncSidebarActive(this.router.url);
  }

  private syncSidebarActive(url: string): void {
    const match = this.routeTitleMap().find(({ prefix }) =>
      url.startsWith(prefix),
    );
    const activeTitle = match?.title ?? null;
    (
      this.elementRef.nativeElement.querySelectorAll(
        'li.menu-item--leaf, li.menu-item--child',
      ) as NodeListOf<HTMLElement>
    ).forEach((li: HTMLElement) => {
      const title = li.querySelector('span')?.textContent?.trim();
      li.classList.toggle(
        'ant-menu-item-selected',
        !!activeTitle && title === activeTitle,
      );
    });
  }

  private createRouteTitleMap(
    items: MenuItemConfig[],
  ): Array<{ prefix: string; title: string }> {
    const routeItems = this.flattenMenuItems(items)
      .filter((item) => !!item.action && item.action.startsWith('/'))
      .map((item) => ({
        prefix: item.action!,
        title: item.title,
      }))
      .sort((a, b) => b.prefix.length - a.prefix.length);

    return routeItems;
  }

  private flattenMenuItems(items: MenuItemConfig[]): MenuItemConfig[] {
    return items.flatMap((item) => [
      item,
      ...this.flattenMenuItems(item.children ?? []),
    ]);
  }

  private toMenuItemConfigs(
    menus: Array<{
      nameTh: string;
      nameEn: string;
      path: string;
      icon: string | null;
      children: unknown;
    }>,
  ): MenuItemConfig[] {
    return menus.map((menu) => {
      const children = Array.isArray(menu.children)
        ? this.toMenuItemConfigs(
            menu.children as Array<{
              nameTh: string;
              nameEn: string;
              path: string;
              icon: string | null;
              children: unknown;
            }>,
          )
        : [];

      const title = menu.nameTh?.trim() || menu.nameEn?.trim() || '';
      const path = menu.path?.trim() || '';

      const item: MenuItemConfig = {
        title,
        icon: menu.icon?.trim() || undefined,
      };

      if (children.length > 0) {
        item.children = children;
      } else if (path) {
        item.action = path;
      }

      return item;
    });
  }

  @HostListener('click', ['$event'])
  onLogoClick(event: MouseEvent): void {
    const target = event.target as Element;
    if (target.closest('.logo')) {
      void this.router.navigate([APP_ROUTE_PATHS.HOME]);
    }
  }

  onBellClick(): void {
    void this.notifState.loadNotifications();
  }

  onNotificationTabChange(tab: NotificationFilter): void {
    this.notifState.setTab(tab);
  }

  onNotificationItemClick(item: NotificationItem): void {
    void this.notifState.handleItemClick(item);
  }

  onNotificationMarkAllRead(): void {
    void this.notifState.markAllAsRead();
  }

  onNotificationViewAll(): void {
    this.notifState.navigateToList();
  }

  onUserMenuAction(action: string): void {
    if (action === 'logout') {
      this.logoutConfirmState.open();
    }
  }

  onMenuAction(action: string): void {
    if (action.startsWith('/')) {
      void this.router.navigateByUrl(action);
      return;
    }

    switch (action) {
      case 'goHome':
        this.router.navigate([APP_ROUTE_PATHS.HOME]);
        break;
      case 'goCodexType1':
        this.router.navigate([
          `${APP_ROUTE_PATHS.CODEX}/319b3458-5ece-41bd-b972-c80c393d9cd6`,
        ]);
        break;
      case 'goCodexType2':
        this.router.navigate([
          `${APP_ROUTE_PATHS.CODEX}/13d24a3d-185f-4c1e-b161-b73ae981ddeb`,
        ]);
        break;
      case 'goWorkflowTemplate':
        this.router.navigate(['/workflow/template/create']);
        break;
      case 'goWorkflowMyWorkflow':
        this.router.navigate(['/workflow/document']);
        break;
      case 'goWorkflowMyApprovals':
        this.router.navigate(['/workflow/my/approvals']);
        break;
      case 'goWorkflowStart':
        this.router.navigate(['/workflow/start']);
        break;
      case 'goDocumentNumbers':
        this.router.navigate([APP_ROUTE_PATHS.DOCUMENT_NUMBERS]);
        break;
      case 'goTermService':
        this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE]);
        break;
      case 'goApplicationTracking':
        this.router.navigate([APP_ROUTE_PATHS.APPLICATION_TRACKING]);
        break;
      case 'goHealthCheck':
        this.router.navigate(['/health-check']);
        break;
      case 'appStatus':
        this.router.navigate([APP_ROUTE_PATHS.APP_STATUS]);
        break;
      case 'goServiceRequestManagement':
        this.router.navigate([APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT]);
        break;
    }
  }
}
