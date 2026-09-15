import { computed } from '@angular/core';
import { AdminPortalLayoutState } from './admin-portal-layout.state';

export function selectIsCollapsed(state: AdminPortalLayoutState) {
  return state.isCollapsed;
}

export function selectTriggerIcon(state: AdminPortalLayoutState) {
  return computed(() => (state.isCollapsed() ? 'menu-unfold' : 'menu-fold'));
}
