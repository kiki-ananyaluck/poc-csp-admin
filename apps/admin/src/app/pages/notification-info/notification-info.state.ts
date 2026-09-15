import { Injectable, inject, signal } from '@angular/core';
import { NotificationItem } from '../../services/notification/notification.models';
import { NotificationService } from '../../services/notification/notification.service';

@Injectable()
export class NotificationInfoState {
  private readonly notificationService = inject(NotificationService);

  readonly item = signal<NotificationItem | null>(null);
  readonly isLoading = signal(true);

  async loadItem(id: string): Promise<void> {
    this.isLoading.set(true);

    try {
      const item = await this.notificationService.getNotificationById(id);
      this.item.set(item);

      if (item && !item.isRead) {
        await this.notificationService.markAsRead(id);
        this.item.update((current) =>
          current ? { ...current, isRead: true } : current,
        );
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
