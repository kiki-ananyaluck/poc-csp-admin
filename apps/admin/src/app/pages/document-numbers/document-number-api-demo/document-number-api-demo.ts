import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  SearchInputComponent,
  TagComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { APP_ROUTE_PATHS } from '@admin/app.routes.const';
import {
  CurrentRunningNumberData,
  DocumentNumberPolicyItem,
  GenerateDocumentNumberData,
  ResetDocumentNumberData,
} from '@services/document-number/document-number.models';
import { DocumentNumberService } from '@services/document-number/document-number.service';
import { DmtToolbarComponent } from '../../codex/components/dmt-toolbar/dmt-toolbar';
import { BreadcrumbItem } from '../../codex/codex.types';
import { DOCUMENT_NUMBER_API_DEMO_MESSAGES } from './document-number-api-demo.message';

interface ApiLogItem {
  id: number;
  action: string;
  status: 'success' | 'error';
  request: unknown;
  response: unknown;
  timestamp: Date;
}

@Component({
  selector: 'app-document-number-api-demo',
  standalone: true,
  imports: [
    CommonModule,
    DmtToolbarComponent,
    SearchInputComponent,
    ButtonComponent,
    TagComponent,
    ToastComponent,
  ],
  templateUrl: './document-number-api-demo.html',
  styleUrl: './document-number-api-demo.scss',
})
export class DocumentNumberApiDemo {
  private readonly documentNumberService = inject(DocumentNumberService);
  private readonly router = inject(Router);
  protected readonly messages = DOCUMENT_NUMBER_API_DEMO_MESSAGES;

  protected readonly pageTitle = DOCUMENT_NUMBER_API_DEMO_MESSAGES.PAGE_TITLE;
  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'จัดการเลขเอกสาร', routerLink: APP_ROUTE_PATHS.DOCUMENT_NUMBERS },
    { label: DOCUMENT_NUMBER_API_DEMO_MESSAGES.PAGE_TITLE },
  ];

  readonly isLoading = signal(false);
  readonly policies = signal<DocumentNumberPolicyItem[]>([]);
  readonly filteredPolicies = signal<DocumentNumberPolicyItem[]>([]);
  readonly selectedPolicyCode = signal('');
  readonly searchKeyword = signal('');
  readonly concurrentCount = signal(5);

  readonly currentResult = signal<CurrentRunningNumberData | null>(null);
  readonly generatedResult = signal<GenerateDocumentNumberData | null>(null);
  readonly concurrentResult = signal<GenerateDocumentNumberData[]>([]);
  readonly resetResult = signal<ResetDocumentNumberData | null>(null);

  readonly logs = signal<ApiLogItem[]>([]);
  readonly toastMessage = signal<string | null>(null);
  readonly toastVariant = signal<'success' | 'error'>('success');

  private logSeq = 1;

  constructor() {
    void this.loadPolicies();
  }

  protected onSearchInput(value: string): void {
    this.searchKeyword.set(value.trim());
    const keyword = this.searchKeyword().toLowerCase();

    if (!keyword) {
      this.filteredPolicies.set(this.policies().slice(0, 10));
      return;
    }

    this.filteredPolicies.set(
      this.policies()
        .filter(
          (policy) =>
            policy.policyCode.toLowerCase().includes(keyword) ||
            policy.description.toLowerCase().includes(keyword),
        )
        .slice(0, 10),
    );
  }

  protected selectPolicy(policyCode: string): void {
    this.selectedPolicyCode.set(policyCode);
  }

  protected setConcurrentCount(value: string): void {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    this.concurrentCount.set(Math.max(1, Math.min(parsed, 20)));
  }

  protected async callCurrent(): Promise<void> {
    const policyCode = this.selectedPolicyCode();
    if (!policyCode) {
      this.showError(this.messages.NO_POLICY_SELECTED);
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await this.documentNumberService.getCurrent(policyCode);
      this.currentResult.set(response);
      this.pushLog(
        'GET current',
        'success',
        { configCode: policyCode },
        response,
      );
      this.showSuccess('เรียกดู Current สำเร็จ');
    } catch (error) {
      this.handleApiError('GET current', { configCode: policyCode }, error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async callGenerateOnce(): Promise<void> {
    const policyCode = this.selectedPolicyCode();
    if (!policyCode) {
      this.showError(this.messages.NO_POLICY_SELECTED);
      return;
    }

    this.isLoading.set(true);
    try {
      const request = { configCode: policyCode };
      const response = await this.documentNumberService.generate(request);
      this.generatedResult.set(response);
      this.pushLog('POST generate', 'success', request, response);
      this.showSuccess('Generate สำเร็จ');
    } catch (error) {
      this.handleApiError('POST generate', { configCode: policyCode }, error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async callGenerateConcurrent(): Promise<void> {
    const policyCode = this.selectedPolicyCode();
    if (!policyCode) {
      this.showError(this.messages.NO_POLICY_SELECTED);
      return;
    }

    const count = this.concurrentCount();
    this.isLoading.set(true);

    try {
      const settled = await Promise.allSettled(
        Array.from({ length: count }).map(() =>
          this.documentNumberService.generate({ configCode: policyCode }),
        ),
      );

      const success = settled
        .filter(
          (item): item is PromiseFulfilledResult<GenerateDocumentNumberData> =>
            item.status === 'fulfilled',
        )
        .map((item) => item.value);

      const fail = settled
        .filter(
          (item): item is PromiseRejectedResult => item.status === 'rejected',
        )
        .map((item) => {
          const reason = item.reason as { message?: string };
          return reason.message ?? 'Unknown error';
        });

      this.concurrentResult.set(success);

      this.pushLog(
        'POST generate (concurrent)',
        fail.length === 0 ? 'success' : 'error',
        { configCode: policyCode, requestCount: count },
        {
          successCount: success.length,
          errorCount: fail.length,
          generatedNumbers: success.map((item) => item.documentNumber),
          errors: fail,
        },
      );

      if (fail.length === 0) {
        this.showSuccess(`Generate พร้อมกันสำเร็จ ${success.length} รายการ`);
      } else {
        this.showError(
          `สำเร็จ ${success.length} รายการ, ผิดพลาด ${fail.length} รายการ`,
        );
      }
    } catch (error) {
      this.handleApiError(
        'POST generate (concurrent)',
        { configCode: policyCode, requestCount: count },
        error,
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async callReset(): Promise<void> {
    const policyCode = this.selectedPolicyCode();
    if (!policyCode) {
      this.showError(this.messages.NO_POLICY_SELECTED);
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await this.documentNumberService.reset(policyCode);
      this.resetResult.set(response);
      this.pushLog(
        'POST reset',
        'success',
        { configCode: policyCode },
        response,
      );
      this.showSuccess('Reset สำเร็จ');
    } catch (error) {
      this.handleApiError('POST reset', { configCode: policyCode }, error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected toJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected dismissToast(): void {
    this.toastMessage.set(null);
  }

  protected goToDocumentNumbers(): void {
    void this.router.navigate([APP_ROUTE_PATHS.DOCUMENT_NUMBERS]);
  }

  private async loadPolicies(): Promise<void> {
    try {
      const policies = await this.documentNumberService.getPolicies();
      const sorted = [...policies].sort((a, b) =>
        a.policyCode.localeCompare(b.policyCode),
      );
      this.policies.set(sorted);
      this.filteredPolicies.set(sorted.slice(0, 10));
      const firstActive = sorted.find(
        (item) => item.status.toUpperCase() === 'ACTIVE',
      );
      if (firstActive) {
        this.selectedPolicyCode.set(firstActive.policyCode);
      }
    } catch (error) {
      const typedError = error as { message?: string };
      this.showError(typedError.message ?? 'โหลดรายการนโยบายไม่สำเร็จ');
    }
  }

  private pushLog(
    action: string,
    status: 'success' | 'error',
    request: unknown,
    response: unknown,
  ): void {
    this.logs.update((prev) => [
      {
        id: this.logSeq++,
        action,
        status,
        request,
        response,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }

  private handleApiError(
    action: string,
    request: unknown,
    error: unknown,
  ): void {
    const typedError = error as { message?: string };
    const message = typedError.message ?? 'เกิดข้อผิดพลาดจาก API';

    this.pushLog(action, 'error', request, { message });
    this.showError(message);
  }

  private showSuccess(message: string): void {
    this.toastVariant.set('success');
    this.toastMessage.set(message);
  }

  private showError(message: string): void {
    this.toastVariant.set('error');
    this.toastMessage.set(message);
  }
}
