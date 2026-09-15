import { Injectable, inject, signal, computed } from '@angular/core';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { TermService } from '../../../services/term-service/term.service';
import {
  ListDocumentsParams,
  TermsDocumentSummary,
} from '../../../services/term-service/term.model';

export type TermTabType = 'user' | 'corporate';
export type TermStatus = 'published' | 'inactive';
export type TermType = 'mandatory' | 'non-mandatory';

export interface TermListItem {
  code: string;
  name: string;
  service: string;
  latestVersion: string;
  lastUpdated: string;
  lastUpdatedIso: string;
  type: TermType;
  status: TermStatus;
  tabType: TermTabType;
}

export type TermListSortKey =
  | 'code'
  | 'name'
  | 'service'
  | 'latestVersion'
  | 'lastUpdated'
  | 'type'
  | 'status';

export interface TermFilter {
  types: TermType[];
  statuses: TermStatus[];
}

const MOCK_ITEMS: never[] = [];

@Injectable()
export class ApplicationTermHomeState {
  private readonly termService = inject(TermService);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly activeTab = signal<TermTabType>('user');
  readonly searchQuery = signal('');
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly filterOpen = signal(false);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly sortKey = signal<TermListSortKey | null>(null);
  readonly sortOrder = signal<NzTableSortOrder>(null);

  private readonly items = signal<TermListItem[]>([]);
  readonly filteredItems = this.items.asReadonly();
  readonly hasMore = computed(
    () => this.items().length > 0 && this.items().length < this.totalCount(),
  );

  private readonly filterDraft = signal<TermFilter>({
    types: [],
    statuses: [],
  });
  private readonly appliedFilter = signal<TermFilter>({
    types: [],
    statuses: [],
  });

  readonly appliedTypes = computed(() => this.appliedFilter().types);
  readonly appliedStatuses = computed(() => this.appliedFilter().statuses);

  constructor() {
    void this.loadItems();
  }

  private async loadItems(): Promise<void> {
    this.isLoading.set(true);
    this.items.set([]);
    this.page.set(1);
    try {
      const response = await this.termService.listDocuments(
        this.buildApiParams(),
      );
      const mappedItems = response.items.map(mapToListItem);
      this.items.set(this.applyClientSort(mappedItems));
      this.totalCount.set(response.totalCount);
    } catch {
      this.items.set([]);
      this.totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMore()) {
      return;
    }

    this.isLoadingMore.set(true);
    try {
      const nextPage = this.page() + 1;
      const params = this.buildApiParams();
      params.page = nextPage;
      const response = await this.termService.listDocuments(params);
      const mappedItems = response.items.map(mapToListItem);
      const sortedItems = this.applyClientSort(mappedItems);
      this.items.set([...this.items(), ...sortedItems]);
      this.page.set(nextPage);
      this.totalCount.set(response.totalCount);
    } catch {
      // silently fail on load more
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  private buildApiParams(): ListDocumentsParams {
    const tab = this.activeTab();
    const query = this.searchQuery().trim();
    const filter = this.appliedFilter();

    const params: ListDocumentsParams = {
      customerType: tab === 'user' ? 'INDIVIDUAL' : 'CORPORATE',
      page: this.page(),
      pageSize: this.pageSize(),
    };
    if (query) params.search = query;
    if (filter.types.length === 1) {
      params.conditionType =
        filter.types[0] === 'mandatory' ? 'MANDATORY' : 'OPTIONAL';
    }
    if (filter.statuses.length === 1) {
      params.termsStatus =
        filter.statuses[0] === 'published' ? 'PUBLISHED' : 'INACTIVE';
    }
    return params;
  }

  setTab(tab: TermTabType): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.page.set(1);
    void this.loadItems();
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
    if (this.searchDebounceTimer !== null)
      clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      void this.loadItems();
    }, 300);
  }

  toggleFilter(): void {
    if (this.filterOpen()) {
      this.filterOpen.set(false);
    } else {
      const applied = this.appliedFilter();
      this.filterDraft.set({
        types: [...applied.types],
        statuses: [...applied.statuses],
      });
      this.filterOpen.set(true);
    }
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  isDraftTypeChecked(type: TermType): boolean {
    return this.filterDraft().types.includes(type);
  }

  isDraftStatusChecked(status: TermStatus): boolean {
    return this.filterDraft().statuses.includes(status);
  }

  toggleDraftType(type: TermType): void {
    const draft = this.filterDraft();
    const types = draft.types.includes(type)
      ? draft.types.filter((t) => t !== type)
      : [...draft.types, type];
    this.filterDraft.set({ ...draft, types });
  }

  toggleDraftStatus(status: TermStatus): void {
    const draft = this.filterDraft();
    const statuses = draft.statuses.includes(status)
      ? draft.statuses.filter((s) => s !== status)
      : [...draft.statuses, status];
    this.filterDraft.set({ ...draft, statuses });
  }

  clearDraft(): void {
    this.filterDraft.set({ types: [], statuses: [] });
  }

  applyFilter(): void {
    this.appliedFilter.set({ ...this.filterDraft() });
    this.filterOpen.set(false);
    void this.loadItems();
  }

  removeAppliedType(type: TermType): void {
    const nextTypes = this.appliedFilter().types.filter(
      (value) => value !== type,
    );
    this.appliedFilter.set({
      ...this.appliedFilter(),
      types: nextTypes,
    });
    this.filterDraft.set({
      ...this.filterDraft(),
      types: nextTypes,
    });
    void this.loadItems();
  }

  removeAppliedStatus(status: TermStatus): void {
    const nextStatuses = this.appliedFilter().statuses.filter(
      (value) => value !== status,
    );
    this.appliedFilter.set({
      ...this.appliedFilter(),
      statuses: nextStatuses,
    });
    this.filterDraft.set({
      ...this.filterDraft(),
      statuses: nextStatuses,
    });
    void this.loadItems();
  }

  setSort(key: string, order: NzTableSortOrder): void {
    if (!isTermListSortKey(key)) {
      return;
    }

    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);
    this.items.set(this.applyClientSort(this.items()));
  }

  private applyClientSort(items: TermListItem[]): TermListItem[] {
    const key = this.sortKey();
    const order = this.sortOrder();
    if (!key || !order) {
      return [...items];
    }

    const direction = order === 'ascend' ? 1 : -1;
    return [...items].sort((a, b) => {
      switch (key) {
        case 'latestVersion':
          return direction * compareVersion(a.latestVersion, b.latestVersion);
        case 'lastUpdated':
          return (
            direction * compareDateValue(a.lastUpdatedIso, b.lastUpdatedIso)
          );
        case 'code':
        case 'name':
        case 'service':
        case 'type':
        case 'status':
          return direction * String(a[key]).localeCompare(String(b[key]), 'th');
        default:
          return 0;
      }
    });
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

function mapToListItem(doc: TermsDocumentSummary): TermListItem {
  return {
    code: doc.documentCode,
    name: doc.title,
    service: doc.applicationCode,
    latestVersion: doc.latestVersion ?? '',
    lastUpdated: formatIsoDate(doc.updatedAt ?? ''),
    lastUpdatedIso: doc.updatedAt ?? '',
    type: doc.conditionType === 'MANDATORY' ? 'mandatory' : 'non-mandatory',
    status: doc.termsStatus === 'PUBLISHED' ? 'published' : 'inactive',
    tabType: doc.customerType === 'INDIVIDUAL' ? 'user' : 'corporate',
  };
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

function isTermListSortKey(key: string): key is TermListSortKey {
  return [
    'code',
    'name',
    'service',
    'latestVersion',
    'lastUpdated',
    'type',
    'status',
  ].includes(key);
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

function compareDateValue(a: string, b: string): number {
  const left = Date.parse(a);
  const right = Date.parse(b);
  if (Number.isNaN(left) && Number.isNaN(right)) return 0;
  if (Number.isNaN(left)) return -1;
  if (Number.isNaN(right)) return 1;
  return left - right;
}
