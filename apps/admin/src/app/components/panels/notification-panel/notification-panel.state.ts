import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  NotificationFilter,
  NotificationItem,
} from '../../../services/notification/notification.models';
import { NotificationService } from '../../../services/notification/notification.service';
import { RealtimeAppConnectionService } from '../../../services/realtime/realtime-app-connection.service';
import { APP_ROUTE_PATHS } from '../../../app.routes.const';

@Injectable()
export class NotificationPanelState {
  private readonly notificationService = inject(NotificationService);
  private readonly realtimeAppConnectionService = inject(
    RealtimeAppConnectionService,
  );
  private readonly router = inject(Router);

  readonly activeTab = signal<NotificationFilter>('all');
  readonly items = signal<NotificationItem[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly unreadCount = computed(
    () => this.items().filter((n) => !n.isRead).length,
  );

  constructor() {
    effect(() => {
      const payload =
        this.realtimeAppConnectionService.lastNotificationPayload();
      if (payload !== null) {
        void this.loadNotifications();
      }
    });
  }

  async loadNotifications(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const res = await this.notificationService.getNotificationList({
        filter: this.activeTab(),
        page: 1,
        pageSize: 10,
      });

      this.items.set(res.items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load notifications';
      this.error.set(errorMessage);
      console.error('Notification panel error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  setTab(tab: NotificationFilter): void {
    this.activeTab.set(tab);
    void this.loadNotifications();
  }

  async handleItemClick(item: NotificationItem): Promise<void> {
    if (!item.isRead) {
      await this.notificationService.markAsRead(item.id);
      this.items.update((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
      void this.realtimeAppConnectionService.loadUnreadCount();
    }

    if (item.type === 'deeplink' && item.deeplink) {
      if (/^https?:\/\//.test(item.deeplink)) {
        window.open(item.deeplink, '_blank', 'noopener,noreferrer');
      } else {
        this.router.navigateByUrl(item.deeplink);
      }
    } else {
      this.router.navigate([APP_ROUTE_PATHS.NOTIFICATION, item.id]);
    }
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationService.markAllAsRead();
    this.items.update((prev) => prev.map((n) => ({ ...n, isRead: true })));
    void this.realtimeAppConnectionService.loadUnreadCount();
  }

  navigateToList(): void {
    this.router.navigate([APP_ROUTE_PATHS.NOTIFICATION]);
  }
}
