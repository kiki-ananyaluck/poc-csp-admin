import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  IconComponent,
  ModalComponent,
  ModalButton,
  ToastComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  ButtonComponent,
  TagComponent,
  IconButtonComponent,
  CheckboxComponent,
} from '@exim/ui-kit';
import { DataManagementRow, SortOrder, SortValue } from '../../codex.types';
import { DATA_MANAGEMENT_TABLE_MESSAGES } from '../../codex.message';

@Component({
  selector: 'app-dmt-data-table',
  standalone: true,
  imports: [
    CommonModule,
    NzTooltipModule,
    IconComponent,
    ModalComponent,
    ToastComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    ButtonComponent,
    TagComponent,
    IconButtonComponent,
    CheckboxComponent,
  ],
  templateUrl: './dmt-data-table.html',
  styleUrl: './dmt-data-table.scss',
})
export class DmtDataTableComponent {
  protected readonly messages = DATA_MANAGEMENT_TABLE_MESSAGES;
  private readonly sortColumns = [
    'no',
    'code',
    'name',
    'nameEn',
    'status',
  ] as const;
  private readonly sortFieldMap: Record<
    'no' | 'code' | 'name' | 'nameEn' | 'status',
    SortValue['field']
  > = {
    no: 'no',
    code: 'code',
    name: 'label:th-TH',
    nameEn: 'label:en-EN',
    status: 'status',
  };
  private sortEmitTimer: ReturnType<typeof setTimeout> | null = null;

  @Input() data: DataManagementRow[] = [];
  @Input() total = 0;
  @Input() loading = false;
  /** async handler ที่ parent ส่งมา รับ array ของ id ที่จะลบ — throw เมื่อ error */
  @Input() deleteHandler: ((ids: (string | number)[]) => Promise<void>) | null =
    null;

  @Output() editClick = new EventEmitter<DataManagementRow>();
  @Output() deleteClick = new EventEmitter<DataManagementRow>();
  @Output() bulkDeleteClick = new EventEmitter<DataManagementRow[]>();
  @Output() sortChange = new EventEmitter<SortValue>();
  @Output() pageChange = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();

  // Internal table state
  protected pageIndex = 1;
  protected pageSize = 10;
  protected checkedAll = signal(false);
  protected indeterminate = signal(false);
  protected checkedIds = signal<Set<string | number>>(new Set());

  protected sortOrders: Record<
    'no' | 'code' | 'name' | 'nameEn' | 'status',
    SortOrder
  > = {
    no: null,
    code: null,
    name: null,
    nameEn: null,
    status: null,
  };

  // Delete modal state
  protected isDeleteModalOpen = signal(false);
  protected deleteIsLoading = signal(false);
  private pendingDeleteRow = signal<DataManagementRow | null>(null);
  protected showDeleteSuccess = signal(false);
  protected showDeleteError = signal(false);

  protected get headerCheckboxConfig() {
    return {
      indeterminate: false,
    };
  }

  protected deleteModalCancelBtn: ModalButton = {
    label: DATA_MANAGEMENT_TABLE_MESSAGES.DELETE_CONFIRM_CANCEL,
    variant: 'secondary',
    action: () => {
      this.isDeleteModalOpen.set(false);
      this.pendingDeleteRow.set(null);
    },
  };

  protected deleteModalConfirmBtn: ModalButton = {
    label: DATA_MANAGEMENT_TABLE_MESSAGES.DELETE_CONFIRM_OK,
    variant: 'primary',
    action: () => {
      this.executeDelete();
    },
  };

  private async executeDelete(): Promise<void> {
    if (!this.deleteHandler) return;
    this.deleteIsLoading.set(true);
    this.showDeleteError.set(false);
    try {
      const single = this.pendingDeleteRow();
      const ids = single
        ? [single.id]
        : this.getSelectedRows().map((r) => r.id);
      await this.deleteHandler(ids);
      this.isDeleteModalOpen.set(false);
      setTimeout(() => this.showDeleteSuccess.set(true), 500);
      if (single) {
        this.pendingDeleteRow.set(null);
      } else {
        this.checkedIds.set(new Set());
      }
    } catch {
      this.isDeleteModalOpen.set(false);
      setTimeout(() => this.showDeleteError.set(true), 500);
    } finally {
      this.deleteIsLoading.set(false);
    }
  }

  protected onRowDeleteClick(row: DataManagementRow): void {
    this.pendingDeleteRow.set(row);
    this.isDeleteModalOpen.set(true);
  }

  protected onBulkDeleteClick(): void {
    this.pendingDeleteRow.set(null);
    this.isDeleteModalOpen.set(true);
  }

  protected onColumnSort(event: { key: string; value: string | null }): void {
    const columnKey = event.key as keyof typeof this.sortFieldMap;
    if (!(columnKey in this.sortFieldMap)) {
      return;
    }

    const order: SortOrder =
      event.value === 'ascend' || event.value === 'descend'
        ? event.value
        : null;

    this.sortColumns.forEach((key) => {
      this.sortOrders[key] = null;
    });
    this.sortOrders[columnKey] = order;

    if (this.sortEmitTimer) {
      clearTimeout(this.sortEmitTimer);
    }

    this.sortEmitTimer = setTimeout(() => {
      this.sortChange.emit({ field: this.sortFieldMap[columnKey], order });
      this.sortEmitTimer = null;
    }, 0);
  }

  protected onAllCheckedFromTable(event: {
    key: string;
    value: boolean;
  }): void {
    this.onCheckAll(event.value);
  }

  protected onCheckAll(checked: boolean): void {
    this.checkedAll.set(checked);
    this.indeterminate.set(false);
    if (checked) {
      this.checkedIds.set(new Set(this.data.map((r) => r['id'])));
    } else {
      this.checkedIds.set(new Set());
    }
  }

  protected onCheckRow(id: string | number, checked: boolean): void {
    const ids = new Set(this.checkedIds());
    if (checked) {
      ids.add(id);
    } else {
      ids.delete(id);
    }
    this.checkedIds.set(ids);
    const total = this.data.length;
    const count = ids.size;
    this.checkedAll.set(count === total);
    this.indeterminate.set(count > 0 && count < total);
  }

  protected isChecked(id: string | number): boolean {
    return this.checkedIds().has(id);
  }

  protected onPageChange(
    event: number | { pageIndex?: number; pageSize?: number; page?: number },
  ): void {
    if (typeof event === 'number') {
      this.pageIndex = event;
    } else {
      this.pageIndex = event.pageIndex ?? event.page ?? this.pageIndex;
      this.pageSize = event.pageSize ?? this.pageSize;
    }
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    });
  }

  protected onPageSizeChange(
    event: number | { pageSize?: number; size?: number },
  ): void {
    this.pageSize =
      typeof event === 'number'
        ? event
        : (event.pageSize ?? event.size ?? this.pageSize);
    this.pageIndex = 1;
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    });
  }

  private getSelectedRows(): DataManagementRow[] {
    const ids = this.checkedIds();
    return this.data.filter((r) => ids.has(r.id));
  }

  protected onDismissDeleteSuccess(): void {
    this.showDeleteSuccess.set(false);
  }
}
