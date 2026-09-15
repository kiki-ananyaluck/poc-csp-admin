import { Injectable, inject, signal, computed } from '@angular/core';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { TermService } from '../../../../services/term-service/term.service';

export type OperatorAcceptance = 'accepted' | 'pending';

export interface TermOperatorItem {
  index: number;
  name: string;
  email: string;
  acceptance: OperatorAcceptance;
  acceptedAt: string;
  acceptedAtIso?: string;
}

export type TermOperatorsSortKey =
  | 'name'
  | 'email'
  | 'acceptance'
  | 'acceptedAt';

export interface TermOperatorsInfo {
  code: string;
  termName: string;
  version: string;
  totalCount: number;
  operators: TermOperatorItem[];
}

const MOCK_OPERATORS: TermOperatorItem[] = [
  {
    index: 1,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '30 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 2,
    name: 'รักษา ใจมั่น',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '29 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 3,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '28 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 4,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '27 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 5,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '26 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 6,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '25 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 7,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '24 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 8,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '23 มิ.ย. 2569 (00:00 น.)',
  },
  {
    index: 9,
    name: 'กมล จิตเอี่ยม',
    email: 'abcdefg@gmail.com',
    acceptance: 'accepted',
    acceptedAt: '22 มิ.ย. 2569 (00:00 น.)',
  },
];

@Injectable()
export class TermVersionOperatorsState {
  private readonly termService = inject(TermService);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private documentCode = '';
  private versionCode = '';

  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly info = signal<TermOperatorsInfo | null>(null);
  readonly searchQuery = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly sortKey = signal<TermOperatorsSortKey | null>(null);
  readonly sortOrder = signal<NzTableSortOrder>(null);

  private readonly operators = signal<TermOperatorItem[]>([]);
  private readonly rawOperators = signal<TermOperatorItem[]>([]);
  readonly filteredOperators = this.operators.asReadonly();
  readonly hasMore = computed(
    () =>
      this.operators().length > 0 &&
      this.operators().length < this.totalCount(),
  );

  async loadInfo(code: string, version: string): Promise<void> {
    this.documentCode = code;
    this.versionCode = version;
    this.isLoading.set(true);
    this.operators.set([]);
    this.rawOperators.set([]);
    this.page.set(1);
    try {
      const response = await this.termService.getConsents(code, version, {
        search: this.searchQuery().trim() || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
      });
      const operators = response.items.map((item, idx) => ({
        index: (this.page() - 1) * this.pageSize() + idx + 1,
        name: item.name,
        email: item.email,
        acceptance: 'accepted' as OperatorAcceptance,
        acceptedAt: formatIsoDate(item.acceptedAt),
        acceptedAtIso: item.acceptedAt,
      }));

      this.info.set({
        code: response.documentCode,
        termName: response.termName,
        version: response.version,
        totalCount: response.totalCount,
        operators,
      });
      this.rawOperators.set(operators);
      this.operators.set(this.applyClientSort(operators));
      this.totalCount.set(response.totalCount);
    } catch {
      this.info.set(null);
      this.operators.set([]);
      this.rawOperators.set([]);
      this.totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  setSearch(query: string): void {
    const normalizedQuery = (query ?? '').trim();
    const normalizedCurrent = this.searchQuery().trim();

    // ex-search-input may emit initial empty value on first render.
    // Skip reloading when the effective query has not changed.
    if (normalizedQuery === normalizedCurrent) {
      return;
    }

    // Guard against early emissions before route params are initialized.
    if (!this.documentCode || !this.versionCode) {
      this.searchQuery.set(query ?? '');
      return;
    }

    this.searchQuery.set(query);
    if (this.searchDebounceTimer !== null)
      clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      void this.loadInfo(this.documentCode, this.versionCode);
    }, 300);
  }

  async loadMore(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMore()) {
      return;
    }

    this.isLoadingMore.set(true);
    try {
      const nextPage = this.page() + 1;
      const response = await this.termService.getConsents(
        this.documentCode,
        this.versionCode,
        {
          search: this.searchQuery().trim() || undefined,
          page: nextPage,
          pageSize: this.pageSize(),
        },
      );
      const newOperators = response.items.map((item, idx) => ({
        index: (nextPage - 1) * this.pageSize() + idx + 1,
        name: item.name,
        email: item.email,
        acceptance: 'accepted' as OperatorAcceptance,
        acceptedAt: formatIsoDate(item.acceptedAt),
        acceptedAtIso: item.acceptedAt,
      }));
      const mergedRaw = [...this.rawOperators(), ...newOperators];
      this.rawOperators.set(mergedRaw);
      this.operators.set(this.applyClientSort(mergedRaw));

      const currentInfo = this.info();
      if (currentInfo) {
        this.info.set({
          ...currentInfo,
          operators: mergedRaw,
          totalCount: response.totalCount,
        });
      }

      this.page.set(nextPage);
      this.totalCount.set(response.totalCount);
    } catch {
      // silently fail on load more
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  setSort(key: string, order: NzTableSortOrder): void {
    if (!isTermOperatorsSortKey(key)) {
      return;
    }

    this.sortKey.set(order ? key : null);
    this.sortOrder.set(order);

    const source = this.rawOperators();
    this.operators.set(this.applyClientSort(source));
  }

  private applyClientSort(items: TermOperatorItem[]): TermOperatorItem[] {
    const key = this.sortKey();
    const order = this.sortOrder();
    if (!key || !order) {
      return [...items];
    }

    const direction = order === 'ascend' ? 1 : -1;
    return [...items].sort((a, b) => {
      switch (key) {
        case 'acceptedAt':
          return direction * compareDateValue(a.acceptedAtIso, b.acceptedAtIso);
        case 'acceptance':
        case 'name':
        case 'email':
          return direction * a[key].localeCompare(b[key], 'th');
        default:
          return 0;
      }
    });
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

function isTermOperatorsSortKey(key: string): key is TermOperatorsSortKey {
  return ['name', 'email', 'acceptance', 'acceptedAt'].includes(key);
}

function compareDateValue(a?: string, b?: string): number {
  const left = Date.parse(a ?? '');
  const right = Date.parse(b ?? '');
  if (Number.isNaN(left) && Number.isNaN(right)) return 0;
  if (Number.isNaN(left)) return -1;
  if (Number.isNaN(right)) return 1;
  return left - right;
}
