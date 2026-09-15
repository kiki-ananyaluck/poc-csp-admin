import { Injectable, inject, signal, computed } from '@angular/core';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { TermService } from '../../../services/term-service/term.service';
import type { TermsChangeType } from '../../../services/term-service/term.model';

export type TermVersionStatus = 'published' | 'inactive';
export type TermDetailType = 'user' | 'corporate';

export interface TermVersionListItem {
  version: string;
  addedAt: string;
  addedAtIso?: string;
  addedBy: string;
  status: TermVersionStatus;
}

export type TermDetailSortKey = 'version' | 'addedAt' | 'addedBy' | 'status';

export interface TermDetailInfo {
  code: string;
  name: string;
  type: TermDetailType;
  versionCount: number;
  latestVersion: string;
  lastUpdated: string;
  updatedAt?: string;
  createdBy: string;
  operationBy?: string;
  versions: TermVersionListItem[];
}

const _MOCK_DATA_REMOVED: Record<string, TermDetailInfo> = {
  'TC-1234569': {
    code: 'TC-1234569',
    name: 'เงื่อนไขการใช้บริการ',
    type: 'user',
    versionCount: 3,
    latestVersion: 'v00.00.03',
    lastUpdated: '27 พ.ค. 2569 (09:00 น.)',
    createdBy: 'สมชาย ดีมาก',
    versions: [
      {
        version: 'v00.00.03',
        addedAt: '27 พ.ค. 2569 (09:00 น.)',
        addedBy: 'สมชาย ดีมาก',
        status: 'published',
      },
      {
        version: 'v00.00.02',
        addedAt: '01 เม.ย. 2569 (10:00 น.)',
        addedBy: 'สมชาย ดีมาก',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ม.ค. 2569 (08:00 น.)',
        addedBy: 'สมชาย ดีมาก',
        status: 'inactive',
      },
    ],
  },
  'TC-1234568': {
    code: 'TC-1234568',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 2,
    latestVersion: 'v00.00.02',
    lastUpdated: '20 พ.ค. 2569 (14:30 น.)',
    createdBy: 'วิภา รักงาน',
    versions: [
      {
        version: 'v00.00.02',
        addedAt: '20 พ.ค. 2569 (14:30 น.)',
        addedBy: 'วิภา รักงาน',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '10 ก.พ. 2569 (09:00 น.)',
        addedBy: 'วิภา รักงาน',
        status: 'inactive',
      },
    ],
  },
  'TC-1234567': {
    code: 'TC-1234567',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 5,
    latestVersion: 'v00.00.05',
    lastUpdated: '15 พ.ค. 2569 (11:00 น.)',
    createdBy: 'สวัสดี ฉันแอดมิน',
    versions: [
      {
        version: 'v00.00.05',
        addedAt: '15 พ.ค. 2569 (11:00 น.)',
        addedBy: 'สวัสดี ฉันแอดมิน',
        status: 'published',
      },
      {
        version: 'v00.00.04',
        addedAt: '01 พ.ค. 2569 (09:00 น.)',
        addedBy: 'สวัสดี ฉันแอดมิน',
        status: 'inactive',
      },
      {
        version: 'v00.00.03',
        addedAt: '01 เม.ย. 2569 (09:00 น.)',
        addedBy: 'สวัสดี ฉันแอดมิน',
        status: 'inactive',
      },
      {
        version: 'v00.00.02',
        addedAt: '01 มี.ค. 2569 (09:00 น.)',
        addedBy: 'สวัสดี ฉันแอดมิน',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ก.พ. 2569 (09:00 น.)',
        addedBy: 'สวัสดี ฉันแอดมิน',
        status: 'inactive',
      },
    ],
  },
  'TC-1234566': {
    code: 'TC-1234566',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 4,
    latestVersion: 'v00.00.04',
    lastUpdated: '10 พ.ค. 2569 (13:00 น.)',
    createdBy: 'ประภัส ใจงาม',
    versions: [
      {
        version: 'v00.00.04',
        addedAt: '10 พ.ค. 2569 (13:00 น.)',
        addedBy: 'ประภัส ใจงาม',
        status: 'published',
      },
      {
        version: 'v00.00.03',
        addedAt: '01 เม.ย. 2569 (09:00 น.)',
        addedBy: 'ประภัส ใจงาม',
        status: 'inactive',
      },
      {
        version: 'v00.00.02',
        addedAt: '01 มี.ค. 2569 (09:00 น.)',
        addedBy: 'ประภัส ใจงาม',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ก.พ. 2569 (09:00 น.)',
        addedBy: 'ประภัส ใจงาม',
        status: 'inactive',
      },
    ],
  },
  'TC-1234565': {
    code: 'TC-1234565',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 1,
    latestVersion: 'v00.00.01',
    lastUpdated: '05 พ.ค. 2569 (10:00 น.)',
    createdBy: 'กานต์ ศรีสุข',
    versions: [
      {
        version: 'v00.00.01',
        addedAt: '05 พ.ค. 2569 (10:00 น.)',
        addedBy: 'กานต์ ศรีสุข',
        status: 'inactive',
      },
    ],
  },
  'TC-1234564': {
    code: 'TC-1234564',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 2,
    latestVersion: 'v00.00.02',
    lastUpdated: '01 พ.ค. 2569 (09:00 น.)',
    createdBy: 'มาลี สวยงาม',
    versions: [
      {
        version: 'v00.00.02',
        addedAt: '01 พ.ค. 2569 (09:00 น.)',
        addedBy: 'มาลี สวยงาม',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 มี.ค. 2569 (09:00 น.)',
        addedBy: 'มาลี สวยงาม',
        status: 'inactive',
      },
    ],
  },
  'TC-1234563': {
    code: 'TC-1234563',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 3,
    latestVersion: 'v00.00.03',
    lastUpdated: '25 เม.ย. 2569 (15:00 น.)',
    createdBy: 'ธนัช พรอมร',
    versions: [
      {
        version: 'v00.00.03',
        addedAt: '25 เม.ย. 2569 (15:00 น.)',
        addedBy: 'ธนัช พรอมร',
        status: 'inactive',
      },
      {
        version: 'v00.00.02',
        addedAt: '01 มี.ค. 2569 (09:00 น.)',
        addedBy: 'ธนัช พรอมร',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ม.ค. 2569 (08:00 น.)',
        addedBy: 'ธนัช พรอมร',
        status: 'inactive',
      },
    ],
  },
  'TC-1234562': {
    code: 'TC-1234562',
    name: 'การสื่อสารส่งเสริมการขาย',
    type: 'user',
    versionCount: 4,
    latestVersion: 'v00.00.04',
    lastUpdated: '20 เม.ย. 2569 (09:30 น.)',
    createdBy: 'ณรงค์ สมศักดิ์',
    versions: [
      {
        version: 'v00.00.04',
        addedAt: '20 เม.ย. 2569 (09:30 น.)',
        addedBy: 'ณรงค์ สมศักดิ์',
        status: 'published',
      },
      {
        version: 'v00.00.03',
        addedAt: '01 เม.ย. 2569 (09:00 น.)',
        addedBy: 'ณรงค์ สมศักดิ์',
        status: 'inactive',
      },
      {
        version: 'v00.00.02',
        addedAt: '01 มี.ค. 2569 (09:00 น.)',
        addedBy: 'ณรงค์ สมศักดิ์',
        status: 'inactive',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ก.พ. 2569 (09:00 น.)',
        addedBy: 'ณรงค์ สมศักดิ์',
        status: 'inactive',
      },
    ],
  },
  'TC-2234569': {
    code: 'TC-2234569',
    name: 'เงื่อนไขการใช้บริการนิติบุคคล',
    type: 'corporate',
    versionCount: 2,
    latestVersion: 'v00.00.02',
    lastUpdated: '27 พ.ค. 2569 (09:00 น.)',
    createdBy: 'สมชาย ดีมาก',
    versions: [
      {
        version: 'v00.00.02',
        addedAt: '27 พ.ค. 2569 (09:00 น.)',
        addedBy: 'สมชาย ดีมาก',
        status: 'published',
      },
      {
        version: 'v00.00.01',
        addedAt: '01 ม.ค. 2569 (08:00 น.)',
        addedBy: 'สมชาย ดีมาก',
        status: 'inactive',
      },
    ],
  },
  'TC-2234568': {
    code: 'TC-2234568',
    name: 'การสื่อสารส่งเสริมการขาย (นิติบุคคล)',
    type: 'corporate',
    versionCount: 1,
    latestVersion: 'v00.00.01',
    lastUpdated: '15 พ.ค. 2569 (11:00 น.)',
    createdBy: 'วิภา รักงาน',
    versions: [
      {
        version: 'v00.00.01',
        addedAt: '15 พ.ค. 2569 (11:00 น.)',
        addedBy: 'วิภา รักงาน',
        status: 'inactive',
      },
    ],
  },
};
export interface EditStatusModal {
  code: string;
  version: string;
  selectedStatus: TermVersionStatus;
  // Only relevant when selectedStatus === 'published'. Defaults to MAJOR (safer: forces re-consent).
  changeType: TermsChangeType;
}

@Injectable()
export class ApplicationTermDetailState {
  private readonly termService = inject(TermService);
  private documentCode = '';

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly detail = signal<TermDetailInfo | null>(null);
  readonly editModal = signal<EditStatusModal | null>(null);
  readonly sortKey = signal<TermDetailSortKey | null>(null);
  readonly sortOrder = signal<NzTableSortOrder>(null);

  private allVersions: TermVersionListItem[] = [];
  readonly versionPageSize = 20;
  readonly isLoadingMoreVersions = signal(false);
  readonly versionPage = signal(1);
  readonly hasMoreVersions = computed(
    () =>
      this.allVersions.length > 0 &&
      this.allVersions.length > this.versionPageSize * this.versionPage(),
  );

  readonly isUserType = computed(() => this.detail()?.type === 'user');

  async loadDetail(code: string): Promise<void> {
    this.documentCode = code;
    this.isLoading.set(true);
    try {
      const data = await this.termService.getDocument(code);
      const allVersionsData = data.versions.map((v) => ({
        version: v.version,
        addedAt: formatIsoDate(v.createdAt),
        addedAtIso: v.createdAt,
        addedBy: v.operationBy || '-',
        status:
          v.status === 'PUBLISHED'
            ? 'published'
            : ('inactive' as TermVersionStatus),
      }));

      this.allVersions = allVersionsData;
      this.versionPage.set(1);
      const displayVersions = this.getDisplayedVersions(allVersionsData);
      const formattedUpdatedAt = formatIsoDate(data.updatedAt ?? '');
      this.detail.set({
        code: data.documentCode,
        name: data.title,
        type: data.customerType === 'INDIVIDUAL' ? 'user' : 'corporate',
        versionCount: data.versionCount,
        latestVersion: data.latestVersion ?? '',
        lastUpdated: formattedUpdatedAt,
        updatedAt: formattedUpdatedAt,
        operationBy: data.operationBy || '-',
        createdBy: data.operationBy || '-',
        versions: this.applyClientSort(displayVersions),
      });
    } catch {
      this.allVersions = [];
      this.versionPage.set(1);
      this.detail.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreVersions(): Promise<void> {
    if (this.isLoadingMoreVersions() || !this.hasMoreVersions()) {
      return;
    }

    this.isLoadingMoreVersions.set(true);
    try {
      this.versionPage.set(this.versionPage() + 1);
      this.syncDisplayedVersions();
    } finally {
      this.isLoadingMoreVersions.set(false);
    }
  }

  private getDisplayedVersions(
    allVersions: TermVersionListItem[],
  ): TermVersionListItem[] {
    const endIndex = this.versionPage() * this.versionPageSize;
    return allVersions.slice(0, endIndex);
  }

  setSort(key: string, order: NzTableSortOrder): void {
    if (!isTermDetailSortKey(key)) {
      return;
    }

    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);
    this.syncDisplayedVersions();
  }

  private syncDisplayedVersions(): void {
    const current = this.detail();
    if (!current) {
      return;
    }

    const displayed = this.getDisplayedVersions(this.allVersions);
    this.detail.set({
      ...current,
      versions: this.applyClientSort(displayed),
    });
  }

  private applyClientSort(items: TermVersionListItem[]): TermVersionListItem[] {
    const key = this.sortKey();
    const order = this.sortOrder();
    if (!key || !order) {
      return [...items];
    }

    const direction = order === 'ascend' ? 1 : -1;
    return [...items].sort((a, b) => {
      switch (key) {
        case 'version':
          return direction * compareVersion(a.version, b.version);
        case 'addedAt':
          return direction * compareDateValue(a.addedAtIso, b.addedAtIso);
        case 'addedBy':
        case 'status':
          return direction * a[key].localeCompare(b[key], 'th');
        default:
          return 0;
      }
    });
  }

  openEditModal(
    code: string,
    version: string,
    currentStatus: TermVersionStatus,
  ): void {
    this.editModal.set({
      code,
      version,
      selectedStatus: currentStatus,
      changeType: 'MAJOR',
    });
  }

  closeEditModal(): void {
    this.editModal.set(null);
  }

  selectEditStatus(status: TermVersionStatus): void {
    const m = this.editModal();
    if (m) this.editModal.set({ ...m, selectedStatus: status });
  }

  selectChangeType(changeType: TermsChangeType): void {
    const m = this.editModal();
    if (m) this.editModal.set({ ...m, changeType });
  }

  async saveEditStatus(): Promise<void> {
    const m = this.editModal();
    if (!m) return;
    this.isSaving.set(true);
    try {
      if (m.selectedStatus === 'published') {
        await this.termService.publishVersion(m.code, m.version, m.changeType);
        this.triggerToast('Published ข้อมูลเรียบร้อยแล้ว');
      } else {
        await this.termService.deactivateVersion(m.code, m.version);
        this.triggerToast('Inactive ข้อมูลเรียบร้อยแล้ว');
      }
      this.closeEditModal();
      await this.loadDetail(this.documentCode);
    } catch {
      this.triggerToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
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

function formatIsoDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    const datePart = date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Bangkok',
    });
    const timePart = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Bangkok',
    });
    return `${datePart} (${timePart} น.)`;
  } catch {
    return isoDate;
  }
}

function isTermDetailSortKey(key: string): key is TermDetailSortKey {
  return ['version', 'addedAt', 'addedBy', 'status'].includes(key);
}

function compareVersion(a: string, b: string): number {
  const parse = (value: string) =>
    value
      .replace(/^v/i, '')
      .split('.')
      .map((part) => Number(part) || 0);

  const left = parse(a);
  const right = parse(b);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function compareDateValue(a?: string, b?: string): number {
  const left = Date.parse(a ?? '');
  const right = Date.parse(b ?? '');
  if (Number.isNaN(left) && Number.isNaN(right)) return 0;
  if (Number.isNaN(left)) return -1;
  if (Number.isNaN(right)) return 1;
  return left - right;
}
