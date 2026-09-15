import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
  IconComponent,
  ModalComponent,
  FormAlertComponent,
  ToastComponent,
  IconService,
  ButtonComponent,
} from '@exim/ui-kit';
import { ReviewRow } from '../../codex.types';
import { DATA_MANAGEMENT_TABLE_MESSAGES } from '../../codex.message';
import { AuditMasterdataPanelComponent } from '../../../../components/panels/audit-masterdata-panel/audit-masterdata-panel';

const MOCK_REVIEW_ROWS: ReviewRow[] = [
  {
    no: 1,
    code: 'MD-0000001',
    nameTh: 'รายชื่อสาขาธนาคาร 1',
    nameEn: 'Bank Name 1',
    status: 'active',
    remark: 'อยู่แล้วในระบบ',
    hasError: false,
  },
  {
    no: 2,
    code: '{Code}',
    nameTh: 'รายชื่อสาขาธนาคาร 2',
    nameEn: 'Bank Name 2',
    status: 'active',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 3,
    code: '{Code}',
    nameTh: '{Name TH}',
    nameEn: '{Name EN}',
    status: 'active',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 4,
    code: '{Code}',
    nameTh: '{Name TH}',
    nameEn: '{Name EN}',
    status: 'active',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 5,
    code: 'MD-0000005',
    nameTh: 'รายชื่อสาขา 5',
    nameEn: 'Bank Name 5',
    status: 'active',
    remark: '',
    hasError: false,
  },
  {
    no: 6,
    code: '{Code}',
    nameTh: '{Name TH}',
    nameEn: '{Name EN}',
    status: 'inactive',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 7,
    code: 'MD-0000007',
    nameTh: 'รายชื่อสาขา 7',
    nameEn: 'Bank Name 7',
    status: 'active',
    remark: '',
    hasError: false,
  },
  {
    no: 8,
    code: '{Code}',
    nameTh: '{Name TH}',
    nameEn: '{Name EN}',
    status: 'active',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 9,
    code: '{Code}',
    nameTh: '{Name TH}',
    nameEn: '{Name EN}',
    status: 'active',
    remark: '{Error Reason}',
    hasError: true,
  },
  {
    no: 10,
    code: 'MD-0000010',
    nameTh: 'รายชื่อสาขา 10',
    nameEn: 'Bank Name 10',
    status: 'active',
    remark: '',
    hasError: false,
  },
];

@Component({
  selector: 'app-dmt-import-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    IconComponent,
    FormAlertComponent,
    ToastComponent,
    ButtonComponent,
    AuditMasterdataPanelComponent,
  ],
  templateUrl: './dmt-import-modal.html',
  styleUrl: './dmt-import-modal.scss',
})
export class DmtImportModalComponent implements OnChanges {
  protected readonly messages = DATA_MANAGEMENT_TABLE_MESSAGES;
  private readonly iconService = inject(IconService);

  constructor() {
    this.iconService.registerIconSvg(
      'download-data',
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M16.34 2H7.67C4.28 2 2 4.38 2 7.92V16.09C2 19.62 4.28 22 7.67 22H16.34C19.73 22 22 19.62 22 16.09V7.92C22 4.38 19.73 2 16.34 2Z" fill="currentColor"/><path d="M16.5 8.25H7.5C7.09 8.25 6.75 7.91 6.75 7.5C6.75 7.09 7.09 6.75 7.5 6.75H16.5C16.91 6.75 17.25 7.09 17.25 7.5C17.25 7.91 16.91 8.25 16.5 8.25Z" fill="currentColor"/><path d="M16.5 12.75H7.5C7.09 12.75 6.75 12.41 6.75 12C6.75 11.59 7.09 11.25 7.5 11.25H16.5C16.91 11.25 17.25 11.59 17.25 12C17.25 12.41 16.91 12.75 16.5 12.75Z" fill="currentColor"/><path d="M16.5 17.25H7.5C7.09 17.25 6.75 16.91 6.75 16.5C6.75 16.09 7.09 15.75 7.5 15.75H16.5C16.91 15.75 17.25 16.09 17.25 16.5C17.25 16.91 16.91 17.25 16.5 17.25Z" fill="currentColor"/></svg>`,
    );
  }

  @Input() isOpen = false;
  @Input() importHandler:
    | ((file: File) => Promise<{
        rows: ReviewRow[];
        missingColumns?: string[];
        inserted?: number;
      }>)
    | null = null;
  @Input() importNetworkError = false;
  @Input() importMissingColumns: string[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() importSuccess = new EventEmitter<{ inserted: number }>();
  @Output() dismissSuccess = new EventEmitter<void>();

  // Internal state
  protected importSelectedFile = signal<File | null>(null);
  protected importStatus = signal<'processing' | 'review' | 'fault'>(
    'processing',
  );
  protected importIsLoading = signal(false);
  protected reviewRows = signal<ReviewRow[]>([]);
  protected importErrorType = signal<
    'network' | 'format' | 'size' | 'columns' | null
  >(null);
  protected importMissingColumnNames = signal<string[]>([]);
  protected isSuccessToast = signal(false);
  protected insertedCount = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['importNetworkError']) {
      if (this.importNetworkError) {
        this.importErrorType.set('network');
      } else if (this.importErrorType() === 'network') {
        this.importErrorType.set(null);
      }
    }
    if (changes['importMissingColumns']) {
      if (this.importMissingColumns.length > 0) {
        this.importMissingColumnNames.set(this.importMissingColumns);
        this.importErrorType.set('columns');
      } else if (this.importErrorType() === 'columns') {
        this.importMissingColumnNames.set([]);
        this.importErrorType.set(null);
      }
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.resetState();
    }
  }

  protected get importHasError(): boolean {
    return this.importErrorType() !== null;
  }

  protected get importErrorMessage(): string {
    if (this.importErrorType() === 'format')
      return DATA_MANAGEMENT_TABLE_MESSAGES.IMPORT_FORMAT_ERROR;
    if (this.importErrorType() === 'size')
      return DATA_MANAGEMENT_TABLE_MESSAGES.IMPORT_SIZE_ERROR;
    if (this.importErrorType() === 'columns') {
      const cols = this.importMissingColumnNames().join(', ');
      return DATA_MANAGEMENT_TABLE_MESSAGES.IMPORT_COLUMNS_ERROR.replace(
        '{columns}',
        cols,
      );
    }
    return DATA_MANAGEMENT_TABLE_MESSAGES.IMPORT_NETWORK_ERROR;
  }

  protected onClose(): void {
    this.resetState();
    this.closed.emit();
  }

  private resetState(): void {
    this.importErrorType.set(null);
    this.importMissingColumnNames.set([]);
    this.importSelectedFile.set(null);
    this.importStatus.set('processing');
    this.reviewRows.set([]);
    this.importIsLoading.set(false);
  }

  protected onImportFileChange(input: HTMLInputElement): void {
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;
    if (!this.validateFile(file)) return;
    this.importSelectedFile.set(file);
    if (this.importHandler) this.runImportHandler(file);
  }

  protected onImportDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file) return;
    if (!this.validateFile(file)) return;
    this.importSelectedFile.set(file);
    if (this.importHandler) this.runImportHandler(file);
  }

  private validateFile(file: File): boolean {
    const allowed = ['.csv', '.xlsx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      this.importErrorType.set('format');
      return false;
    }
    if (file.size > 300 * 1024 * 1024) {
      this.importErrorType.set('size');
      return false;
    }
    this.importErrorType.set(null);
    return true;
  }

  private runImportHandler(file: File): void {
    this.importIsLoading.set(true);
    setTimeout(() => {
      this.importHandler!(file)
        .then((result) => {
          const missingColumns = result.missingColumns ?? [];
          if (missingColumns.length > 0) {
            this.importMissingColumnNames.set(missingColumns);
            this.importErrorType.set('columns');
            this.importSelectedFile.set(null);
            return;
          }
          const rows = result.rows ?? [];
          if (rows.length === 0) {
            this.insertedCount.set(result.inserted ?? 0);
            this.isSuccessToast.set(true);
            this.importSuccess.emit({ inserted: result.inserted ?? 0 });
            this.resetState();
            this.closed.emit();
            return;
          }
          this.reviewRows.set(rows);
          this.importStatus.set('review');
        })
        .catch(() => {
          this.importErrorType.set('network');
          this.importSelectedFile.set(null);
        })
        .finally(() => this.importIsLoading.set(false));
    });
  }

  protected onImportChangeFile(): void {
    this.importSelectedFile.set(null);
    this.importErrorType.set(null);
    this.importStatus.set('processing');
  }

  protected onImportSubmit(): void {
    this.reviewRows.set(MOCK_REVIEW_ROWS);
    this.importStatus.set('review');
  }

  protected onReviewReimport(): void {
    this.importSelectedFile.set(null);
    this.importStatus.set('processing');
    this.importErrorType.set(null);
    this.reviewRows.set([]);
  }

  protected onImportRetry(): void {
    this.importSelectedFile.set(null);
    this.importStatus.set('processing');
    this.importErrorType.set(null);
  }

  protected onDismissSuccess(): void {
    this.isSuccessToast.set(false);
    this.dismissSuccess.emit();
  }
}
