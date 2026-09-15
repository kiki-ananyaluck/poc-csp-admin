import { Injectable, signal } from '@angular/core';
import { DataManagementRow } from './codex.types';

@Injectable()
export class CodexState {
  private readonly _rows = signal<DataManagementRow[]>([]);
  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _importNetworkError = signal(false);
  private readonly _isImportModalOpen = signal(false);
  private readonly _appliedStatusActive = signal(false);
  private readonly _appliedStatusInactive = signal(false);
  private readonly _showSuccessToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _hasUserInteracted = signal(false);

  readonly rows = this._rows.asReadonly();
  readonly total = this._total.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly importNetworkError = this._importNetworkError.asReadonly();
  readonly isImportModalOpen = this._isImportModalOpen.asReadonly();
  readonly appliedStatusActive = this._appliedStatusActive.asReadonly();
  readonly appliedStatusInactive = this._appliedStatusInactive.asReadonly();
  readonly showSuccessToast = this._showSuccessToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly hasUserInteracted = this._hasUserInteracted.asReadonly();

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setRows(rows: DataManagementRow[]): void {
    this._rows.set(rows);
  }

  setTotal(total: number): void {
    this._total.set(total);
  }

  setHasUserInteracted(value: boolean): void {
    this._hasUserInteracted.set(value);
  }

  setAppliedStatusActive(value: boolean): void {
    this._appliedStatusActive.set(value);
  }

  setAppliedStatusInactive(value: boolean): void {
    this._appliedStatusInactive.set(value);
  }

  openImportModal(): void {
    this._isImportModalOpen.set(true);
  }

  closeImportModal(): void {
    this._isImportModalOpen.set(false);
  }

  private _toastTimer?: ReturnType<typeof setTimeout>;

  showToast(message: string): void {
    this._toastMessage.set(message);
    this._showSuccessToast.set(false);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this._showSuccessToast.set(true), 0);
  }

  dismissToast(): void {
    this._showSuccessToast.set(false);
  }
}
