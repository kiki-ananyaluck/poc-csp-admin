import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_ROUTE_PATHS } from '@admin/app.routes.const';
import {
  ButtonComponent,
  ModalButton,
  ModalComponent,
  TagComponent,
  ToastComponent,
} from '@exim/ui-kit';
import {
  CurrentRunningNumberData,
  GenerateDocumentNumberData,
  ResetDocumentNumberData,
} from '@services/document-number/document-number.models';
import { DocumentNumberService } from '@services/document-number/document-number.service';
import { DOCUMENT_NUMBER_DETAIL_MESSAGES } from './document-number-detail.message';

@Component({
  selector: 'app-document-number-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TagComponent,
    ModalComponent,
    ToastComponent,
  ],
  templateUrl: './document-number-detail.html',
  styleUrl: './document-number-detail.scss',
})
export class DocumentNumberDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly documentNumberService = inject(DocumentNumberService);
  protected readonly messages = DOCUMENT_NUMBER_DETAIL_MESSAGES;

  readonly configCode = signal('');
  readonly current = signal<CurrentRunningNumberData | null>(null);
  readonly generated = signal<GenerateDocumentNumberData | null>(null);
  readonly latestReset = signal<ResetDocumentNumberData | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isResetModalOpen = signal(false);
  readonly toastMessage = signal<string | null>(null);
  readonly toastVariant = signal<'success' | 'error'>('success');

  protected readonly resetCancelButton: ModalButton = {
    label: this.messages.RESET_MODAL_CANCEL,
    variant: 'secondary',
    action: () => {
      this.isResetModalOpen.set(false);
    },
  };

  protected readonly resetConfirmButton: ModalButton = {
    label: this.messages.RESET_MODAL_CONFIRM,
    variant: 'primary',
    action: () => {
      void this.confirmReset();
    },
  };

  constructor() {
    const configCode =
      this.route.snapshot.paramMap.get('configCode')?.trim().toUpperCase() ?? '';

    this.configCode.set(configCode);
    void this.loadCurrent();
  }

  async loadCurrent(): Promise<void> {
    if (!this.configCode()) {
      this.errorMessage.set('Config code is required');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      const current = await this.documentNumberService.getCurrent(
        this.configCode(),
      );
      this.current.set(current);
    } catch (error) {
      const typedError = error as { message?: string };
      this.errorMessage.set(typedError.message ?? this.messages.LOAD_ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  async generate(): Promise<void> {
    if (!this.configCode()) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      const generated = await this.documentNumberService.generate({
        configCode: this.configCode(),
      });
      this.generated.set(generated);
      this.toastVariant.set('success');
      this.toastMessage.set(
        `${this.messages.GENERATED_SUCCESS_PREFIX} ${generated.documentNumber}`,
      );
      await this.loadCurrent();
    } catch (error) {
      const typedError = error as { message?: string };
      this.toastVariant.set('error');
      this.toastMessage.set(typedError.message ?? this.messages.GENERATE_ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  openResetModal(): void {
    this.isResetModalOpen.set(true);
  }

  private async confirmReset(): Promise<void> {
    if (!this.configCode()) return;

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      const reset = await this.documentNumberService.reset(this.configCode());
      this.latestReset.set(reset);
      this.toastVariant.set('success');
      this.toastMessage.set(
        `${this.messages.RESET_SUCCESS_PREFIX} ${reset.previousNumber} -> ${reset.resetTo}`,
      );
      this.isResetModalOpen.set(false);
      await this.loadCurrent();
    } catch (error) {
      const typedError = error as { message?: string };
      this.toastVariant.set('error');
      this.toastMessage.set(typedError.message ?? this.messages.RESET_ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  backToList(): void {
    void this.router.navigate([APP_ROUTE_PATHS.DOCUMENT_NUMBERS]);
  }

  protected dismissToast(): void {
    this.toastMessage.set(null);
  }
}
