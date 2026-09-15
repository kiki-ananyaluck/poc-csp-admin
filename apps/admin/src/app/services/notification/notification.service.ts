import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '@exim/auth-sdk';
import { firstValueFrom } from 'rxjs';
import {
  GetNotificationsParams,
  NotificationApiDetailData,
  NotificationApiDetailResponse,
  NotificationApiItem,
  NotificationApiListResponse,
  NotificationItem,
  NotificationListResponse,
  NotificationMarkReadResponse,
  NotificationParams,
  NotificationUnreadCountResponse,
} from './notification.models';
import { environment } from '@environments/environments';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['notification']}/v1`;

  async getNotifications(
    params: NotificationParams,
  ): Promise<NotificationApiListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.isRead !== undefined) {
      httpParams = httpParams.set('isRead', params.isRead);
    }

    if (params.notificationType) {
      httpParams = httpParams.set('notificationType', params.notificationType);
    }

    if (params.scope) {
      httpParams = httpParams.set('scope', params.scope);
    }

    return await firstValueFrom(
      this.http.get<NotificationApiListResponse>(
        `${this.baseUrl}/notifications`,
        {
          params: httpParams,
        },
      ),
    );
  }

  async getNotificationList(
    params: GetNotificationsParams,
  ): Promise<NotificationListResponse> {
    const request: NotificationParams = {
      page: params.page,
      size: params.pageSize,
      isRead: params.filter === 'unread' ? false : undefined,
    };

    const response = await this.getNotifications(request);
    const data = response.data;

    if (!data) {
      throw new Error('Notification list response is missing data');
    }

    return {
      items: data.items.map((item) => this.mapNotificationItem(item)),
      total: data.totalCount,
      unreadCount: data.unreadCount,
    };
  }

  async getNotificationById(id: string): Promise<NotificationItem | null> {
    const response = await firstValueFrom(
      this.http.get<NotificationApiDetailResponse>(
        `${this.baseUrl}/notifications/${id}`,
      ),
    );
    const data = response.data;

    if (!data) {
      return null;
    }

    return this.mapNotificationDetail(data);
  }

  async getUnreadCount(): Promise<number> {
    const response = await firstValueFrom(
      this.http.get<NotificationUnreadCountResponse>(
        `${this.baseUrl}/notifications/unread-count`,
      ),
    );
    const data = this.getRequiredData(
      response,
      'Notification unread count response is missing data',
    );

    return data.unreadCount;
  }

  async markAsRead(id: string): Promise<void> {
    await firstValueFrom(
      this.http.patch<NotificationMarkReadResponse>(
        `${this.baseUrl}/notifications/${id}/read`,
        null,
      ),
    );
  }

  async markAllAsRead(): Promise<void> {
    await firstValueFrom(
      this.http.patch<NotificationMarkReadResponse>(
        `${this.baseUrl}/notifications/read-all`,
        null,
      ),
    );
  }

  private mapNotificationItem(item: NotificationApiItem): NotificationItem {
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      iconType: this.mapNotificationIconType(item.notificationType),
      type: item.actionLink ? 'deeplink' : 'read-only',
      deeplink: item.actionLink ?? undefined,
      isRead: item.isRead,
      createdAt: item.createdAt,
    };
  }

  private mapNotificationDetail(
    item: NotificationApiDetailData,
  ): NotificationItem {
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      iconType: this.mapNotificationIconType(item.notificationType),
      type: item.actionLink ? 'deeplink' : 'read-only',
      deeplink: item.actionLink ?? undefined,
      isRead: item.isRead,
      createdAt: item.createdAt,
      specialDetail: item.specialDetail ?? undefined,
      detail: this.formatDetail(item.detail),
    };
  }

  private mapNotificationIconType(
    notificationType: string,
  ): NotificationItem['iconType'] {
    switch (notificationType.toLowerCase()) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  private getRequiredData<T>(
    response: ApiResponse<T>,
    errorMessage: string,
  ): T {
    if (!response.data) {
      throw new Error(errorMessage);
    }

    return response.data;
  }

  private formatDetail(detail?: string | null): string | undefined {
    if (!detail) {
      return undefined;
    }

    return detail
      .split('\n')
      .map((line) => line.trim())
      .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
      .map((line) => {
        if (!line) {
          return '<br/>';
        }

        if (line.startsWith('- ')) {
          return `• ${line.slice(2)}`;
        }

        return line;
      })
      .join('<br/>');
  }
}
