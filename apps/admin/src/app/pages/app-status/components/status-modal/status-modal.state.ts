import { Injectable, signal } from '@angular/core';
import { SubAppRow, SubAppStatus } from '../../app-status.types';

@Injectable()
export class StatusModalState {
  readonly isOpen = signal(false);
  readonly selectedStatus = signal<SubAppStatus>('active');
  readonly description = signal('');

  private _targetRow: SubAppRow | null = null;
  private _onSuccess?: (
    id: string | number,
    status: SubAppStatus,
    description: string,
  ) => void;

  get targetRow(): SubAppRow | null {
    return this._targetRow;
  }

  open(
    row: SubAppRow,
    onSuccess?: (
      id: string | number,
      status: SubAppStatus,
      description: string,
    ) => void,
  ): void {
    this._targetRow = row;
    this._onSuccess = onSuccess;
    this.selectedStatus.set(row.status);
    this.description.set(row.description);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this._targetRow = null;
  }

  confirm(): void {
    if (!this._targetRow) return;
    this._onSuccess?.(
      this._targetRow.id,
      this.selectedStatus(),
      this.description(),
    );
    this.close();
  }
}
