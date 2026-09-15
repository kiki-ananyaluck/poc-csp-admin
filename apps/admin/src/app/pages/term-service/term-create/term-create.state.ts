import { Injectable, inject, signal, computed } from '@angular/core';
import { TermService } from '../../../services/term-service/term.service';
import { AppManagementService } from '../../app-status/app-management.service';
import {
  ConditionType,
  CustomerType,
  TermsChangeType,
} from '../../../services/term-service/term.model';
import {
  DropdownOption,
  fromPortableQuillHtml,
  toPortableQuillHtml,
} from '@exim/ui-kit';

export interface TermCreateForm {
  title: string;
  customerType: CustomerType;
  applicationCode: string;
  conditionType: ConditionType;
  conditionTitle: string;
  content: string;
}

@Injectable()
export class TermCreateState {
  private readonly termService = inject(TermService);
  private readonly appManagementService = inject(AppManagementService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly documentTitle = signal('');
  readonly documentCode = signal('');
  // Currently-live (published) version this draft will supersede; the next number derives from it.
  readonly latestVersion = signal('');
  // All existing version numbers (any status) — used to skip collisions, mirroring the backend.
  readonly existingVersions = signal<string[]>([]);
  // Admin's MAJOR/MINOR choice. MAJOR bumps the integer part (re-consent); MINOR the decimal (no re-consent).
  readonly changeType = signal<TermsChangeType>('MAJOR');
  readonly nextVersion = computed(() =>
    computeNextVersion(
      this.latestVersion(),
      this.changeType(),
      this.existingVersions(),
    ),
  );
  readonly sourceVersion = signal<string | null>(null);
  readonly showConfirmClearDialog = signal(false);
  readonly form = signal<TermCreateForm>({
    title: 'ข้อกำหนดและเงื่อนไข',
    customerType: 'INDIVIDUAL',
    applicationCode: '',
    conditionType: 'MANDATORY',
    conditionTitle: '',
    content: '',
  });
  readonly serviceOptions = signal<DropdownOption[]>([]);
  private copiedConditionTitle = '';

  constructor() {
    void this.loadServices();
  }

  private async loadServices(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.appManagementService.getApps({
        isActive: true,
        pageSize: 100,
      });
      this.serviceOptions.set(
        response.data.items.map((app) => ({
          value: app.appCode,
          label: app.appName,
        })),
      );
    } catch {
      this.serviceOptions.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  patchForm(patch: Partial<TermCreateForm>): void {
    this.form.set({ ...this.form(), ...patch });
  }

  setChangeType(changeType: TermsChangeType): void {
    this.changeType.set(changeType);
  }

  async initVersionMode(code: string): Promise<void> {
    this.isLoading.set(true);
    this.copiedConditionTitle = '';
    try {
      const data = await this.termService.getDocument(code);
      this.documentCode.set(data.documentCode);
      this.documentTitle.set(data.title);
      // Base = HIGHEST existing version (any status), bump from it — matches backend.
      // e.g. highest v8.0 → Major v9.0 / Minor v8.1.
      const versionStrings = (data.versions ?? []).map((v) => v.version);
      this.existingVersions.set(versionStrings);
      this.latestVersion.set(highestVersion(versionStrings));
      this.patchForm({
        title: data.title ?? '',
        customerType: data.customerType,
        applicationCode: data.applicationCode,
        conditionType: data.conditionType,
        conditionTitle: data.conditionTitle ?? '',
      });
    } catch {
      // ignore
    } finally {
      this.isLoading.set(false);
    }
  }

  async copyFromVersion(code: string, version: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.termService.getVersionDetail(code, version);
      const fallbackConditionTitle =
        data.conditions
          ?.map((item) => item.label?.trim() ?? '')
          .find((label) => label.length > 0) ?? '';
      this.copiedConditionTitle = fallbackConditionTitle;

      this.sourceVersion.set(version);
      this.patchForm({
        conditionTitle: data.conditionTitle?.trim() || fallbackConditionTitle,
        content: fromPortableQuillHtml(data.content ?? ''),
      });
    } catch {
      this.copiedConditionTitle = '';
      this.patchForm({
        conditionTitle: '',
        content: '',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  openConfirmClearDialog(): void {
    this.showConfirmClearDialog.set(true);
  }

  closeConfirmClearDialog(): void {
    this.showConfirmClearDialog.set(false);
  }

  confirmClear(): void {
    this.sourceVersion.set(null);
    this.showConfirmClearDialog.set(false);
    this.copiedConditionTitle = '';
    this.patchForm({
      conditionTitle: '',
      content: '',
    });
  }

  ensureConditionTitleFromCopyFallback(): boolean {
    const current = this.form().conditionTitle.trim();
    if (current.length > 0 || !this.copiedConditionTitle) {
      return false;
    }

    this.patchForm({ conditionTitle: this.copiedConditionTitle });
    return true;
  }

  async submit(): Promise<string | null> {
    const form = this.form();
    this.isSaving.set(true);
    try {
      const docResponse = await this.termService.createDocument({
        customerType: form.customerType,
        applicationCode: form.applicationCode,
        title: form.title.trim() || form.conditionTitle.trim(),
      });
      await this.termService.createVersion(docResponse.documentCode, {
        title: form.title.trim() || form.conditionTitle.trim(),
        conditionType: form.conditionType,
        conditionTitle: form.conditionTitle.trim(),
        effectiveAt: new Date().toISOString(),
        content: toPortableQuillHtml(form.content),
        changeType: this.changeType(),
        conditions: [
          {
            consentCode: `${docResponse.documentCode}-MAIN`,
            inputType: 'CHECKBOX',
            label: form.conditionTitle.trim(),
            isRequired: form.conditionType === 'MANDATORY',
          },
        ],
      });
      return docResponse.documentCode;
    } catch {
      return null;
    } finally {
      this.isSaving.set(false);
    }
  }

  async submitVersion(code: string): Promise<boolean> {
    const form = this.form();
    this.isSaving.set(true);
    try {
      await this.termService.createVersion(code, {
        title: form.title.trim() || form.conditionTitle.trim(),
        conditionType: form.conditionType,
        conditionTitle: form.conditionTitle.trim(),
        effectiveAt: new Date().toISOString(),
        content: toPortableQuillHtml(form.content),
        changeType: this.changeType(),
        conditions: [
          {
            consentCode: `${code}-MAIN`,
            inputType: 'CHECKBOX',
            label: form.conditionTitle.trim(),
            isRequired: form.conditionType === 'MANDATORY',
          },
        ],
      });
      return true;
    } catch {
      return false;
    } finally {
      this.isSaving.set(false);
    }
  }

  private readonly _showToast = signal(false);
  private readonly _toastMessage = signal('');
  private readonly _toastVariant = signal<'success' | 'error'>('success');
  private _toastTimer?: ReturnType<typeof setTimeout>;

  readonly showToast = this._showToast.asReadonly();
  readonly toastMessage = this._toastMessage.asReadonly();
  readonly toastVariant = this._toastVariant.asReadonly();

  triggerToast(
    message: string,
    variant: 'success' | 'error' = 'success',
  ): void {
    this._toastMessage.set(message);
    this._toastVariant.set(variant);
    this._showToast.set(false);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this._showToast.set(true), 0);
  }

  dismissToast(): void {
    this._showToast.set(false);
  }
}

/**
 * Mirrors the backend ComputeNextVersion + uniqueness guard: MAJOR bumps the integer part and resets
 * the decimal (v7.0 → v8.0); MINOR bumps the decimal part (v7.0 → v7.1). Falls back to v1.0 when there
 * is no live version yet, then keeps bumping (same axis) past any number already taken — so an existing
 * Inactive v8.0 makes a MAJOR land on v9.0. Preview only; the backend assigns the authoritative number.
 */
function computeNextVersion(
  latestVersion: string,
  changeType: TermsChangeType,
  existingVersions: string[] = [],
): string {
  const match = /^v?(\d+)\.(\d+)/i.exec((latestVersion ?? '').trim());
  let candidate = match
    ? bumpVersion(Number(match[1]), Number(match[2]), changeType)
    : 'v1.0';

  const taken = new Set(existingVersions);
  while (taken.has(candidate)) {
    const m = /^v?(\d+)\.(\d+)/i.exec(candidate);
    if (!m) break;
    candidate = bumpVersion(Number(m[1]), Number(m[2]), changeType);
  }

  return candidate;
}

function bumpVersion(
  major: number,
  minor: number,
  changeType: TermsChangeType,
): string {
  return changeType === 'MAJOR' ? `v${major + 1}.0` : `v${major}.${minor + 1}`;
}

/** Returns the highest vX.Y string in the list (by major, then minor); '' if none parse. */
function highestVersion(versions: string[]): string {
  let best = '';
  let bestMajor = -1;
  let bestMinor = -1;

  for (const version of versions) {
    const match = /^v?(\d+)\.(\d+)/i.exec((version ?? '').trim());
    if (!match) continue;

    const major = Number(match[1]);
    const minor = Number(match[2]);
    if (major > bestMajor || (major === bestMajor && minor > bestMinor)) {
      best = version;
      bestMajor = major;
      bestMinor = minor;
    }
  }

  return best;
}
