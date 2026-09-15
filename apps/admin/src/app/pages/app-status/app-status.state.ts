import { Injectable, inject, signal, computed } from '@angular/core';
import { SubAppRow, SubAppStatus } from './app-status.types';
import {
  AppManagementService,
  AppRegistrationDto,
} from './app-management.service';

@Injectable()
export class AppStatusState {
  private readonly appManagementService = inject(AppManagementService);

  private readonly _rows = signal<SubAppRow[]>([]);
  private readonly _loading = signal(false);
  private readonly _checkedIds = signal<Set<string | number>>(new Set());
  private readonly _showSuccessToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _toastVariant = signal<'success' | 'error'>('success');
  private readonly _page = signal(1);
  private readonly _pageSize = signal(10);
  private readonly _totalCount = signal(0);

  readonly rows = this._rows.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly checkedIds = this._checkedIds.asReadonly();
  readonly showSuccessToast = this._showSuccessToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly toastVariant = this._toastVariant.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();

  readonly isAllChecked = computed(
    () =>
      this._rows().length > 0 &&
      this._checkedIds().size === this._rows().length,
  );

  readonly isIndeterminate = computed(
    () =>
      this._checkedIds().size > 0 &&
      this._checkedIds().size < this._rows().length,
  );

  readonly checkedRows = computed(() =>
    this._rows().filter((r) => this._checkedIds().has(r.id)),
  );

  isChecked(id: string | number): boolean {
    return this._checkedIds().has(id);
  }

  toggleCheck(id: string | number): void {
    this._checkedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  setAllChecked(checked: boolean): void {
    if (checked) {
      this._checkedIds.set(new Set(this._rows().map((r) => r.id)));
    } else {
      this._checkedIds.set(new Set());
    }
  }

  clearChecked(): void {
    this._checkedIds.set(new Set());
  }

  async loadApps(page?: number, pageSize?: number): Promise<void> {
    if (page !== undefined) this._page.set(page);
    if (pageSize !== undefined) this._pageSize.set(pageSize);

    this._loading.set(true);
    try {
      const response = await this.appManagementService.getApps({
        page: this._page(),
        pageSize: this._pageSize(),
        sortBy: 'sortOrder',
        sortDirection: 'asc',
      });
      const rows: SubAppRow[] = response.data.items.map((item) =>
        this.mapToSubAppRow(item),
      );
      this._rows.set(rows);
      this._totalCount.set(response.data.totalCount);
    } catch (error) {
      console.error('Failed to load apps:', error);
      this._rows.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  private mapToSubAppRow(item: AppRegistrationDto): SubAppRow {
    return {
      id: item.id,
      name: item.appName,
      version: item.version,
      status: this.mapStatus(item.currentStatus),
      description: item.description ?? '',
      announcementTag: item.announcementTag ?? '',
      updatedAt: item.updatedAt,
    };
  }

  private mapStatus(status: string): SubAppStatus {
    switch (status) {
      case 'active':
        return 'active';
      case 'maintenance':
        return 'maintenance';
      case 'inactive':
        return 'inactive';
      default:
        return 'inactive';
    }
  }

  async updateStatus(
    ids: (string | number)[],
    status: SubAppStatus,
    description = '',
  ): Promise<{ success: boolean; detail?: string }> {
    const statusMap: Record<SubAppStatus, string> = {
      active: 'active',
      maintenance: 'maintenance',
      inactive: 'inactive',
    };

    try {
      for (const id of ids) {
        let row = this._rows().find((r) => r.id === id);
        console.log('[updateStatus] id:', id, 'row.updatedAt:', row?.updatedAt);
        try {
          await this.appManagementService.changeAppStatus(String(id), {
            status: statusMap[status],
            description: status === 'maintenance' ? description : '',
            updatedAt: row?.updatedAt ?? new Date().toISOString(),
          });
        } catch (err: unknown) {
          const statusCode =
            typeof err === 'object' && err !== null && 'status' in err
              ? (err as { status?: number }).status
              : undefined;

          if (statusCode === 409) {
            console.log('[updateStatus] Got 409, reloading...');
            await this.loadApps();
            row = this._rows().find((r) => r.id === id);
            console.log('[updateStatus] Retry with updatedAt:', row?.updatedAt);
            await this.appManagementService.changeAppStatus(String(id), {
              status: statusMap[status],
              description: status === 'maintenance' ? description : '',
              updatedAt: row?.updatedAt ?? new Date().toISOString(),
            });
          } else {
            throw err;
          }
        }
      }
      await this.loadApps();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      console.error('Failed to update status:', error);
      return { success: false, detail: errorMessage };
    }
  }

  private _toastTimer?: ReturnType<typeof setTimeout>;

  showToast(message: string, variant: 'success' | 'error' = 'success'): void {
    this._toastMessage.set(message);
    this._toastVariant.set(variant);
    // Reset ก่อนเสมอ เพื่อไม่ให้ toast ค้างซ้อนกัน
    this._showSuccessToast.set(false);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this._showSuccessToast.set(true), 0);
  }

  dismissToast(): void {
    this._showSuccessToast.set(false);
  }
}
