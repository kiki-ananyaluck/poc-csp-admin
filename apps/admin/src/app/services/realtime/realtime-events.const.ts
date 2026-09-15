export const REALTIME_HUB = 'notify' as const;

/** SignalR hub event names for the 'notify' hub */
export const REALTIME_EVENTS = {
  NOTIFICATION: 'Notification',
  UNREAD_COUNT_UPDATED: 'UnreadCountUpdated',
  MAINTENANCE_TOGGLE: 'MaintenanceToggle',
} as const;
