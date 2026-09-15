import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  TagComponent,
  ButtonComponent,
  IconButtonComponent,
  CheckboxComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { AppStatusState } from '../../app-status.state';
import { SubAppRow } from '../../app-status.types';
import { APP_STATUS_MESSAGES } from '../../app-status.message';

@Component({
  selector: 'app-status-table',
  standalone: true,
  imports: [
    NzTooltipModule,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    ButtonComponent,
    IconButtonComponent,
    CheckboxComponent,
    ToastComponent,
  ],
  templateUrl: './status-table.html',
  styleUrl: './status-table.scss',
})
export class StatusTableComponent {
  protected readonly state = inject(AppStatusState);
  protected readonly messages = APP_STATUS_MESSAGES;

  @Output() manageStatusClick = new EventEmitter<SubAppRow>();
  @Output() bulkMaintenanceClick = new EventEmitter<void>();

  protected pageIndex = signal(1);

  protected onAllChecked(checked: boolean): void {
    this.state.setAllChecked(!!checked);
  }

  protected onManageStatusClick(row: SubAppRow): void {
    this.manageStatusClick.emit(row);
  }

  protected async onBulkActive(): Promise<void> {
    const ids = [...this.state.checkedIds()];
    const result = await this.state.updateStatus(ids, 'active');
    this.state.clearChecked();
    if (result.success) {
      this.state.showToast(APP_STATUS_MESSAGES.TOAST_SUCCESS);
    } else {
      this.state.showToast(result.detail!, 'error');
    }
  }

  protected onBulkMaintenance(): void {
    this.bulkMaintenanceClick.emit();
  }

  protected async onBulkInactive(): Promise<void> {
    const ids = [...this.state.checkedIds()];
    const result = await this.state.updateStatus(ids, 'inactive');
    this.state.clearChecked();
    if (result.success) {
      this.state.showToast(APP_STATUS_MESSAGES.TOAST_SUCCESS);
    } else {
      this.state.showToast(result.detail!, 'error');
    }
  }

  protected onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.state.clearChecked();
    this.state.loadApps(event.pageIndex, event.pageSize);
  }
}
