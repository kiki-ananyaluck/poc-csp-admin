import { Injectable, signal, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CodexService } from '../../../../services/codex-service/codex.service';
import { DataManagementRow } from '../../codex.types';

type UpsertMode = 'create' | 'edit';

@Injectable()
export class ModalUpsertCodexState {
  private readonly codexService = inject(CodexService);

  readonly isOpenModal = signal(false);
  readonly isLoading = signal(false);
  readonly mode = signal<UpsertMode>('create');
  readonly editCode = signal('');

  private categoryId = '';
  private editRow: DataManagementRow | null = null;
  private successCallback?: () => void;

  readonly bankForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    nameTh: new FormControl('', [Validators.required]),
    nameEn: new FormControl('', [Validators.required]),
    status: new FormControl('active', [Validators.required]),
  });

  onOpen(categoryId = '', onSuccess?: () => void): void {
    this.mode.set('create');
    this.categoryId = categoryId;
    this.editRow = null;
    this.successCallback = onSuccess;
    this.bankForm.reset({ code: '', nameTh: '', nameEn: '', status: 'active' });
    this.isOpenModal.set(true);
  }

  onOpenEdit(row: DataManagementRow, onSuccess?: () => void): void {
    this.mode.set('edit');
    this.editRow = row;
    this.editCode.set(row.code);
    this.successCallback = onSuccess;
    this.bankForm.reset({
      code: row.code,
      nameTh: row.name,
      nameEn: row.nameEn ?? '',
      status: row.status,
    });
    this.isOpenModal.set(true);
  }

  async onConfirm(): Promise<void> {
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      return;
    }

    const { code, nameTh, nameEn, status } = this.bankForm.value;

    this.isLoading.set(true);
    try {
      if (this.mode() === 'edit' && this.editRow) {
        await this.codexService.updateEntry(String(this.editRow.id), {
          id: String(this.editRow.id),
          sortOrder: 0,
          metadata: null,
          expectedVersion: this.editRow.version ?? 0,
          localizations: [
            { locale: 'th-TH', label: nameTh ?? '', description: '' },
            { locale: 'en-EN', label: nameEn ?? '', description: '' },
          ],
          isActive: status === 'active',
        });
      } else {
        await this.codexService.createEntry({
          categoryId: this.categoryId,
          code: code ?? '',
          companyId: '',
          parentEntryId: '',
          level: 1,
          sortOrder: 0,
          metadata: null,
          localizations: [
            { locale: 'th-TH', label: nameTh ?? '', description: '' },
            { locale: 'en-EN', label: nameEn ?? '', description: '' },
          ],
          isActive: true,
        });
      }
      this.isOpenModal.set(false);
      this.successCallback?.();
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel(): void {
    this.isOpenModal.set(false);
  }
}
