import { Injectable, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  NotificationFilter,
  NotificationItem,
} from '../../services/notification/notification.models';
import { NotificationService } from '../../services/notification/notification.service';
import { RealtimeAppConnectionService } from '../../services/realtime/realtime-app-connection.service';
import { APP_ROUTE_PATHS } from '../../app.routes.const';

const PAGE_SIZE = 20;

@Injectable()
export class NotificationState {
  private readonly notificationService = inject(NotificationService);
  private readonly realtimeAppConnectionService = inject(
    RealtimeAppConnectionService,
  );
  private readonly router = inject(Router);

  readonly activeTab = signal<NotificationFilter>('all');
  readonly items = signal<NotificationItem[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly hasMore = signal(true);
  private page = 1;
  private total = 0;

  constructor() {
    effect(() => {
      const payload =
        this.realtimeAppConnectionService.lastNotificationPayload();
      if (payload !== null) {
        void this.loadInitial();
      }
    });
  }

  async loadInitial(): Promise<void> {
    this.page = 1;
    this.items.set([]);
    this.hasMore.set(true);
    this.isLoading.set(true);

    try {
      const res = await this.notificationService.getNotificationList({
        filter: this.activeTab(),
        page: 1,
        pageSize: PAGE_SIZE,
      });

      this.items.set(res.items);
      this.total = res.total;
      this.hasMore.set(res.items.length < res.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);
    this.page += 1;

    try {
      const res = await this.notificationService.getNotificationList({
        filter: this.activeTab(),
        page: this.page,
        pageSize: PAGE_SIZE,
      });

      this.items.update((prev) => [...prev, ...res.items]);
      this.hasMore.set(this.items().length < res.total);
    } catch {
      this.page -= 1;
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  setTab(tab: NotificationFilter): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    void this.loadInitial();
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
}
