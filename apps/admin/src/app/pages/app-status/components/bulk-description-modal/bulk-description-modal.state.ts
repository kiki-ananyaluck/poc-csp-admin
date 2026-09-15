import { Injectable, signal } from '@angular/core';

@Injectable()
export class BulkDescriptionModalState {
  readonly isOpen = signal(false);
  readonly description = signal('');

  private _onSuccess?: (description: string) => void;

  open(onSuccess?: (description: string) => void): void {
    this._onSuccess = onSuccess;
    this.description.set('');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  confirm(): void {
    this._onSuccess?.(this.description());
    this.close();
  }
}
