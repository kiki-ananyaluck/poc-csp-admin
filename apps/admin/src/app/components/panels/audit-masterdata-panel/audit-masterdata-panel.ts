import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { IconComponent, IconService, FormAlertComponent } from '@exim/ui-kit';
import { AUDIT_MASTERDATA_MESSAGES } from './audit-masterdata-panel.message';

export interface AuditRow {
  no: number;
  code: string;
  nameTh: string;
  nameEn: string;
  status: 'active' | 'inactive';
  remark: string;
  hasError: boolean;
}

@Component({
  selector: 'app-audit-masterdata-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    IconComponent,
    FormAlertComponent,
  ],
  templateUrl: './audit-masterdata-panel.html',
  styleUrl: './audit-masterdata-panel.scss',
})
export class AuditMasterdataPanelComponent {
  private readonly iconService = inject(IconService);

  constructor() {
    this.iconService.registerIconSvg(
      'amd-reimport',
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a1 1 0 0 1 1 1v10.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L11 13.586V3a1 1 0 0 1 1-1Z" fill="currentColor"/><path opacity="0.4" d="M4 17a1 1 0 0 1 1 1v1h14v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" fill="currentColor"/></svg>`,
    );
    this.iconService.registerIconSvg(
      'amd-danger-circle',
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" fill="currentColor"/><path d="M12 7a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1ZM12 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" fill="currentColor"/></svg>`,
    );
  }

  @Input() isOpen = false;
  @Input() rows: AuditRow[] = [];

  @Output() cancelClick = new EventEmitter<void>();
  @Output() reimportClick = new EventEmitter<void>();

  protected readonly messages = AUDIT_MASTERDATA_MESSAGES;

  protected pageIndex = signal(1);
  protected pageSize = signal(10);

  protected get hasErrors(): boolean {
    return this.rows.some((r) => r.hasError);
  }

  protected get pagedRows(): AuditRow[] {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows.slice(start, start + this.pageSize());
  }

  protected get rangeStart(): number {
    return this.rows.length === 0
      ? 0
      : (this.pageIndex() - 1) * this.pageSize() + 1;
  }

  protected get rangeEnd(): number {
    return Math.min(this.pageIndex() * this.pageSize(), this.rows.length);
  }

  protected get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize()));
  }

  protected get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  protected onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
  }

  protected onCancel(): void {
    this.cancelClick.emit();
  }

  protected onReimport(): void {
    this.reimportClick.emit();
  }
}
