import { ApiResponse } from '@exim/auth-sdk';

export type NotificationIconType = 'success' | 'info' | 'warning' | 'error';
export type NotificationType = 'deeplink' | 'read-only';
export type NotificationFilter = 'all' | 'unread';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: NotificationIconType;
  type: NotificationType;
  /** route path to navigate when type === 'deeplink' */
  deeplink?: string;
  isRead: boolean;
  createdAt: string; // ISO 8601
  /** bold heading shown above detail in info page */
  specialDetail?: string;
  /** HTML content rendered in info page */
  detail?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface GetNotificationsParams {
  filter: NotificationFilter;
  page: number;
  pageSize: number;
}

export interface NotificationParams {
  page: number;
  size: number;
  isRead?: boolean;
  notificationType?: string;
  scope?: string;
}

export interface NotificationApiItem {
  id: string;
  title: string;
  subtitle: string;
  notificationType: string;
  scope: string;
  actionLink?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationApiListData {
  items: NotificationApiItem[];
  totalCount: number;
  unreadCount: number;
  page: number;
  size: number;
}

export interface NotificationApiDetailData {
  id: string;
  title: string;
  subtitle: string;
  specialDetail?: string | null;
  detail?: string | null;
  notificationType: string;
  scope: string;
  actionLink?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationUnreadCountData {
  unreadCount: number;
}

export interface NotificationMarkReadData {
  isRead: boolean;
  unreadCount: number;
}

export type NotificationApiListResponse = ApiResponse<NotificationApiListData>;
export type NotificationApiDetailResponse =
  ApiResponse<NotificationApiDetailData>;
export type NotificationUnreadCountResponse =
  ApiResponse<NotificationUnreadCountData>;
export type NotificationMarkReadResponse =
  ApiResponse<NotificationMarkReadData>;
