import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccessDeniedState {
  private _isOpen = signal(false);
  private _appName = signal('');

  readonly isOpen = this._isOpen.asReadonly();
  readonly appName = this._appName.asReadonly();

  open(appName: string) {
    this._appName.set(appName);
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
    this._appName.set('');
  }
}
