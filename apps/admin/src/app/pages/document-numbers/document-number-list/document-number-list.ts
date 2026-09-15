import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTE_PATHS } from '@admin/app.routes.const';
import {
  ButtonComponent,
  CheckboxComponent,
  ModalButton,
  ModalComponent,
  SearchInputComponent,
  TableCellDirective,
  TableColumnComponent,
  TableComponent,
  TagComponent,
  ToastComponent,
} from '@exim/ui-kit';
import {
  DocumentNumberListError,
  DocumentNumberListItem,
  DocumentNumberPolicyItem,
} from '@services/document-number/document-number.models';
import { DocumentNumberService } from '@services/document-number/document-number.service';
import { DOCUMENT_NUMBER_LIST_MESSAGES } from './document-number-list.message';
import { DmtToolbarComponent } from '../../codex/components/dmt-toolbar/dmt-toolbar';
import { BreadcrumbItem } from '../../codex/codex.types';

interface DocumentNumberListRow
  extends DocumentNumberListItem,
    Record<string, unknown> {
  no: number;
  policyDescription: string;
  policyStatus: string;
}

@Component({
  selector: 'app-document-number-list',
  standalone: true,
  imports: [
    CommonModule,
    DmtToolbarComponent,
    SearchInputComponent,
    ButtonComponent,
    CheckboxComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    ModalComponent,
    ToastComponent,
  ],
  templateUrl: './document-number-list.html',
  styleUrl: './document-number-list.scss',
})
export class DocumentNumberList {
  private readonly documentNumberService = inject(DocumentNumberService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);
  protected readonly messages = DOCUMENT_NUMBER_LIST_MESSAGES;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly configCodeInput = signal('');
  readonly rows = signal<DocumentNumberListRow[]>([]);
  readonly errors = signal<DocumentNumberListError[]>([]);
  readonly allPolicies = signal<DocumentNumberPolicyItem[]>([]);
  readonly filteredPolicies = signal<DocumentNumberPolicyItem[]>([]);
  readonly trackedConfigCodes = signal<string[]>([]);
  readonly pendingConfigCodes = signal<string[]>([]);
  readonly isFilterPanelOpen = signal(false);
  readonly isResetModalOpen = signal(false);
  readonly resetTarget = signal<DocumentNumberListRow | null>(null);
  readonly toastMessage = signal<string | null>(null);
  readonly toastVariant = signal<'success' | 'error'>('success');
  protected readonly pageTitle = DOCUMENT_NUMBER_LIST_MESSAGES.PAGE_TITLE;
  protected readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'จัดการเลขเอกสาร' },
    { label: DOCUMENT_NUMBER_LIST_MESSAGES.PAGE_TITLE },
  ];

  protected readonly resetCancelButton: ModalButton = {
    label: this.messages.RESET_MODAL_CANCEL,
    variant: 'secondary',
    action: () => {
      this.isResetModalOpen.set(false);
      this.resetTarget.set(null);
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
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.loadPolicies();
    const defaults = this.allPolicies()
      .filter((policy) => this.isActivePolicy(policy.status))
      .slice(0, 3)
      .map((policy) => policy.policyCode);
    this.trackedConfigCodes.set(defaults);
    this.pendingConfigCodes.set(defaults);
    await this.loadRows();
  }

  private async loadPolicies(): Promise<void> {
    try {
      const policies = await this.documentNumberService.getPolicies();
      const sorted = [...policies].sort((a, b) =>
        a.policyCode.localeCompare(b.policyCode),
      );
      this.allPolicies.set(sorted);
      this.filteredPolicies.set(sorted.slice(0, 12));
    } catch (error) {
      const typedError = error as { message?: string };
      this.toastVariant.set('error');
      this.toastMessage.set(
        typedError.message ?? this.messages.POLICY_LOAD_ERROR,
      );
    }
  }

  async loadRows(): Promise<void> {
    const configCodes = this.trackedConfigCodes();

    if (configCodes.length === 0) {
      this.rows.set([]);
      this.errors.set([]);
      this.errorMessage.set(this.messages.EMPTY_CONFIG_HINT);
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      const result =
        await this.documentNumberService.getCurrentForMany(configCodes);

      const sorted = [...result.items].sort((a, b) =>
        a.configCode.localeCompare(b.configCode),
      );

      const policyMap = new Map(
        this.allPolicies().map((policy) => [policy.policyCode, policy]),
      );

      this.rows.set(
        sorted.map((item, index) => ({
          ...item,
          no: index + 1,
          policyDescription: policyMap.get(item.configCode)?.description ?? '-',
          policyStatus: policyMap.get(item.configCode)?.status ?? 'Unknown',
        })),
      );
      this.errors.set(result.errors);
    } catch (error) {
      const typedError = error as { message?: string };
      this.errorMessage.set(typedError.message ?? this.messages.LOAD_ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchInput(value: string): void {
    this.configCodeInput.set(value.trim());
    const keyword = value.trim().toLowerCase();
    const source = this.allPolicies();

    if (!keyword) {
      this.filteredPolicies.set(source.slice(0, 12));
      return;
    }

    this.filteredPolicies.set(
      source
        .filter(
          (policy) =>
            policy.policyCode.toLowerCase().includes(keyword) ||
            policy.description.toLowerCase().includes(keyword),
        )
        .slice(0, 12),
    );
  }

  protected toggleFilterPanel(): void {
    if (!this.isFilterPanelOpen()) {
      this.pendingConfigCodes.set([...this.trackedConfigCodes()]);
    }
    this.isFilterPanelOpen.update((value) => !value);
  }

  protected onFilterClear(): void {
    this.pendingConfigCodes.set([]);
  }

  protected onFilterCancel(): void {
    this.pendingConfigCodes.set([...this.trackedConfigCodes()]);
    this.isFilterPanelOpen.set(false);
  }

  protected onFilterApply(): void {
    const selected = [...new Set(this.pendingConfigCodes())];
    this.trackedConfigCodes.set(selected);
    this.isFilterPanelOpen.set(false);
    void this.loadRows();
  }

  protected isPendingChecked(policyCode: string): boolean {
    return this.pendingConfigCodes().includes(policyCode);
  }

  protected onPendingPolicyToggle(policyCode: string, checked: boolean): void {
    if (checked) {
      this.pendingConfigCodes.update((prev) =>
        prev.includes(policyCode) ? prev : [...prev, policyCode],
      );
      return;
    }

    this.pendingConfigCodes.update((prev) =>
      prev.filter((code) => code !== policyCode),
    );
  }

  addConfigCode(): void {
    const normalized = this.configCodeInput().trim().toUpperCase();

    if (!normalized) {
      return;
    }

    const policy = this.allPolicies().find(
      (item) => item.policyCode.toUpperCase() === normalized,
    );

    if (!policy) {
      this.toastVariant.set('error');
      this.toastMessage.set(this.messages.POLICY_NOT_FOUND_ERROR);
      return;
    }

    this.addPolicy(policy.policyCode);
  }

  addPolicy(policyCode: string): void {
    if (this.trackedConfigCodes().includes(policyCode)) {
      this.configCodeInput.set('');
      return;
    }

    this.trackedConfigCodes.update((prev) => [...prev, policyCode]);
    this.configCodeInput.set('');
    void this.loadRows();
  }

  removeConfigCode(configCode: string): void {
    this.trackedConfigCodes.update((prev) =>
      prev.filter((item) => item !== configCode),
    );
    void this.loadRows();
  }

  goToDetail(configCode: string): void {
    void this.router.navigate([APP_ROUTE_PATHS.DOCUMENT_NUMBERS, configCode]);
  }

  goToApiDemo(): void {
    void this.router.navigate([APP_ROUTE_PATHS.DOCUMENT_NUMBERS_API_DEMO]);
  }

  openResetModal(row: DocumentNumberListRow): void {
    this.resetTarget.set(row);
    this.isResetModalOpen.set(true);
  }

  protected isRowActive(row: DocumentNumberListRow): boolean {
    return this.isActivePolicy(row.policyStatus);
  }

  private isActivePolicy(status: string): boolean {
    return status.toUpperCase() === 'ACTIVE';
  }

  private async confirmReset(): Promise<void> {
    const row = this.resetTarget();
    if (!row) return;

    this.isLoading.set(true);

    try {
      await this.documentNumberService.reset(row.configCode);
      this.toastVariant.set('success');
      this.toastMessage.set(this.messages.RESET_SUCCESS);
      this.isResetModalOpen.set(false);
      this.resetTarget.set(null);
      await this.loadRows();
    } catch (error) {
      const typedError = error as { message?: string };
      this.toastVariant.set('error');
      this.toastMessage.set(typedError.message ?? this.messages.RESET_ERROR);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected dismissToast(): void {
    this.toastMessage.set(null);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target)) {
      this.isFilterPanelOpen.set(false);
    }
  }
}
