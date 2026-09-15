import type { SrmTabType } from '../service-request-management-list.state';

export const SRM_TAB_TYPES = {
  QUEUE: 'queue',
  MY_WORK: 'my-work',
  IN_PROGRESS: 'in-progress',
  ALL: 'all',
} as const satisfies Record<string, SrmTabType>;

export const SRM_TAB_ACTION_MODE = {
  PICKUP: 'pickup',
  REASSIGN: 'reassign',
} as const;

export const SRM_TAB_ACTION_ICON = {
  PICKUP: 'arhive_fill',
  REASSIGN: 'Swap',
} as const;

export const SRM_TAB_ACTION_LABEL = {
  PICKUP: 'รับงาน',
  REASSIGN: 'เปลี่ยนแปลงผู้รับผิดชอบ',
} as const;
