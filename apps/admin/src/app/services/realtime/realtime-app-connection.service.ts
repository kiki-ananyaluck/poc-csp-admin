import { Injectable, inject, signal } from '@angular/core';
import { RealtimeService } from '@exim/util-sdk';
import { NotificationService } from '../notification/notification.service';
import { REALTIME_EVENTS, REALTIME_HUB } from './realtime-events.const';

interface RealtimeSubscription {
  unsubscribe(): void;
}

interface RealtimeMessage<TPayload = unknown> {
  payload?: TPayload;
  arguments?: TPayload[];
}

@Injectable({ providedIn: 'root' })
export class RealtimeAppConnectionService {
  private readonly realtimeService = inject(RealtimeService);
  private readonly notificationService = inject(NotificationService);

  private initialized = false;
  private subscriptions: RealtimeSubscription[] = [];
  readonly unreadCount = signal(0);
  readonly lastNotificationPayload = signal<unknown>(null);

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      await this.loadUnreadCount();
      await this.realtimeService.connect(REALTIME_HUB);

      const client = this.realtimeService.getClient(REALTIME_HUB);
      this.subscriptions = [
        client.subscribe(
          REALTIME_EVENTS.NOTIFICATION,
          (message: RealtimeMessage) => {
            const payload = message.payload ?? message.arguments?.[0] ?? null;
            this.lastNotificationPayload.set(payload);
            void this.loadUnreadCount();
          },
        ),
        client.subscribe(
          REALTIME_EVENTS.UNREAD_COUNT_UPDATED,
          (message: RealtimeMessage<{ unreadCount?: unknown }>) => {
            const payload = message.payload ?? message.arguments?.[0];
            const unreadCount = payload?.unreadCount;

            if (typeof unreadCount === 'number') {
              this.unreadCount.set(unreadCount);
              return;
            }

            void this.loadUnreadCount();
          },
        ),
        client.subscribe(
          REALTIME_EVENTS.MAINTENANCE_TOGGLE,
          (message: RealtimeMessage) => {
            const payload = message.payload ?? message.arguments?.[0] ?? null;
            console.log('MaintenanceToggle:', payload);
          },
        ),
      ];
    } catch (error) {
      this.initialized = false;
      console.error('Realtime app initialization failed:', error);
    }
  }

  async loadUnreadCount(): Promise<void> {
    try {
      const count = await this.notificationService.getUnreadCount();
      this.unreadCount.set(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }
}
