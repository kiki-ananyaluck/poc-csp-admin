export type AdminPortalLayoutMessage =
  | { type: 'ToggleCollapsed' }
  | { type: 'SetCollapsed'; collapsed: boolean };
