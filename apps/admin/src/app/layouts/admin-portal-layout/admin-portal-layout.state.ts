import { Injectable, signal } from '@angular/core';
import { AdminPortalLayoutMessage } from './admin-portal-layout.message';

export interface AdminPortalLayoutStateModel {
  isCollapsed: boolean;
}

const initialState: AdminPortalLayoutStateModel = {
  isCollapsed: false,
};

@Injectable()
export class AdminPortalLayoutState {
  private readonly _isCollapsed = signal(initialState.isCollapsed);

  readonly isCollapsed = this._isCollapsed.asReadonly();

  dispatch(message: AdminPortalLayoutMessage): void {
    switch (message.type) {
      case 'ToggleCollapsed':
        this._isCollapsed.update((v) => !v);
        break;
      case 'SetCollapsed':
        this._isCollapsed.set(message.collapsed);
        break;
    }
  }

  toggleCollapsed(): void {
    this.dispatch({ type: 'ToggleCollapsed' });
  }

  setCollapsed(collapsed: boolean): void {
    this.dispatch({ type: 'SetCollapsed', collapsed });
  }
}
