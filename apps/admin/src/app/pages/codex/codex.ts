import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import {
  DataManagementRow,
  BreadcrumbItem,
  FilterValue,
  SortValue,
  ReviewRow,
} from './codex.types';
import { DmtToolbarComponent } from './components/dmt-toolbar/dmt-toolbar';
import { DmtSearchFilterComponent } from './components/dmt-search-filter/dmt-search-filter';
import { DmtDataTableComponent } from './components/dmt-data-table/dmt-data-table';
import { DmtImportModalComponent } from './components/dmt-import-modal/dmt-import-modal';
import { CodexModalUpsert } from './components/modal-upsert/modal-upsert';
import { ModalUpsertCodexState } from './components/modal-upsert/modal-upsert.state';
import { CodexService } from '../../services/codex-service/codex.service';
import { CodexEntry } from '../../services/codex-service/codex.model';
import { ToastComponent } from '@exim/ui-kit';
import { CodexState } from './codex.state';

function getLocalization(entry: CodexEntry, locale: string): string {
  return (
    entry.localizations?.find((l) => l.locale === locale)?.label ??
    entry.label ??
    ''
  );
}

function toRow(entry: CodexEntry, no: number): DataManagementRow {
  return {
    id: entry.id,
    no,
    code: entry.code,
    name: getLocalization(entry, 'th-TH'),
    nameEn: getLocalization(entry, 'en-EN'),
    status: entry.isActive ? 'active' : 'inactive',
    version: entry.version,
  };
}

@Component({
  selector: 'app-codex',
  standalone: true,
  imports: [
    DmtToolbarComponent,
    DmtSearchFilterComponent,
    DmtDataTableComponent,
    DmtImportModalComponent,
    CodexModalUpsert,
    ToastComponent,
  ],
  templateUrl: './codex.html',
  styleUrl: './codex.scss',
  providers: [ModalUpsertCodexState, CodexState],
})
export class Codex implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly modalUpsertState = inject(ModalUpsertCodexState);
  readonly state = inject(CodexState);
  private readonly codexService = inject(CodexService);

  private categoryId = '1';

  protected pageTitle = ``;
  protected breadcrumbs: BreadcrumbItem[] = [
    { label: 'จัดการแหล่งข้อมูล' },
    { label: `` },
  ];

  private categoryCode = '';

  private pageIndex = 1;
  private pageSize = 10;
  private searchKeyword = '';
  private sortBy: string | undefined = undefined;
  private sortOrder: 'ASC' | 'DESC' | undefined = undefined;
  private filterActive: boolean | undefined = undefined;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? '1'),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(async (categoryId) => {
        this.categoryId = categoryId;
        this.pageIndex = 1;
        await this.loadCategoryAndEntries();
      });
  }

  private async loadCategoryAndEntries(): Promise<void> {
    await this.loadCategoryIdById();
    await this.loadEntries();
  }

  private async loadCategoryIdById(): Promise<void> {
    try {
      const res = await this.codexService.getCategories(this.categoryId);
      const title = `${res.data.nameTH}`;
      setTimeout(() => {
        this.pageTitle = title;
        this.breadcrumbs = [{ label: 'จัดการแหล่งข้อมูล' }, { label: title }];
      }, 0);
    } catch {
      // categoryId stays empty; import will proceed without it
    }
  }

  private async loadEntries(): Promise<void> {
    this.state.setLoading(true);
    try {
      const res = await this.codexService.getEntries({
        categoryId: this.categoryId,
        pageNumber: this.pageIndex,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        search: this.searchKeyword || undefined,
        isActive: this.filterActive,
      });
      if (res.data) {
        this.state.setRows(
          res.data.items.map((entry, i) =>
            toRow(entry, (this.pageIndex - 1) * this.pageSize + i + 1),
          ),
        );
        this.state.setTotal(res.data.pagination.totalCount);
      }
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string; url?: string };
      console.error('[Codex] loadEntries error:', {
        status: e?.status,
        message: e?.message,
        url: e?.url,
      });
    } finally {
      this.state.setLoading(false);
    }
  }

  protected onSearchChange(keyword: string): void {
    this.state.setHasUserInteracted(true);
    this.searchKeyword = keyword;
    this.pageIndex = 1;
    this.loadEntries();
  }

  protected onSortChange(sort: SortValue): void {
    if (!this.state.hasUserInteracted()) return;
    const fieldMap: Record<string, string> = {
      no: 'sortOrder',
      code: 'code',
      'label:th-TH': 'label:th-TH',
      'label:en-EN': 'label:en-EN',
      status: 'isActive',
    };
    const nextSortBy = sort.order
      ? (fieldMap[sort.field] ?? undefined)
      : undefined;
    const nextSortOrder =
      sort.order === 'descend'
        ? 'DESC'
        : sort.order === 'ascend'
          ? 'ASC'
          : undefined;

    if (this.sortBy === nextSortBy && this.sortOrder === nextSortOrder) {
      return;
    }

    this.sortBy = nextSortBy;
    this.sortOrder = nextSortOrder;
    this.pageIndex = 1;
    this.loadEntries();
  }

  protected onTablePageChange(event: {
    pageIndex: number;
    pageSize: number;
  }): void {
    if (
      this.pageIndex === event.pageIndex &&
      this.pageSize === event.pageSize
    ) {
      return;
    }

    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEntries();
  }

  protected onFilterApply(filter: FilterValue): void {
    this.state.setHasUserInteracted(true);
    this.state.setAppliedStatusActive(filter.statusActive);
    this.state.setAppliedStatusInactive(filter.statusInactive);
    if (filter.statusActive && !filter.statusInactive) {
      this.filterActive = true;
    } else if (filter.statusInactive && !filter.statusActive) {
      this.filterActive = false;
    } else {
      this.filterActive = undefined;
    }
    this.pageIndex = 1;
    this.loadEntries();
  }

  protected onRemoveChip(chip: 'active' | 'inactive'): void {
    if (chip === 'active') this.state.setAppliedStatusActive(false);
    else this.state.setAppliedStatusInactive(false);
    this.onFilterApply({
      statusActive: this.state.appliedStatusActive(),
      statusInactive: this.state.appliedStatusInactive(),
    });
  }

  protected async onDeleteClick(row: DataManagementRow): Promise<void> {
    try {
      await this.codexService.deleteEntry(String(row.id));
      await this.loadEntries();
    } catch {
      // handle silently
    }
  }

  protected async onBulkDeleteClick(rows: DataManagementRow[]): Promise<void> {
    try {
      await Promise.all(
        rows.map((r) => this.codexService.deleteEntry(String(r.id))),
      );
      await this.loadEntries();
    } catch {
      // handle silently
    }
  }

  protected readonly deleteHandler = async (
    ids: (string | number)[],
  ): Promise<void> => {
    await Promise.all(
      ids.map((id) => this.codexService.deleteEntry(String(id))),
    );
    await this.loadEntries();
  };

  protected readonly importHandler = async (
    file: File,
  ): Promise<{
    rows: ReviewRow[];
    missingColumns?: string[];
    inserted?: number;
  }> => {
    const response = await this.codexService.importEntries(
      file,
      this.categoryId,
    );
    const errors = response?.data?.errors ?? [];

    // INVALID_HEADER errors → show columns error banner
    const headerErrors = errors.filter((e) => e.errorCode === 'INVALID_HEADER');
    if (headerErrors.length > 0) {
      const missingColumns = headerErrors
        .map((e) => {
          const match = e.errorMessage?.match(/Expected header '([^']+)'/);
          return match ? match[1] : e.errorMessage;
        })
        .filter((v, i, arr) => arr.indexOf(v) === i); // unique
      return { rows: [], missingColumns };
    }

    // No errors = success
    if (errors.length === 0) {
      return { rows: [], inserted: response?.data?.inserted ?? 0 };
    }
    // const errorCodeToThai: Record<string, string> = {
    //       ROW_DUPLICATE_CODE: 'รหัสซ้ำกันในระบบ',
    //       ROW_INVALID_CODE: 'รหัสไม่ถูกต้อง',
    //       ROW_MISSING_REQUIRED_FIELD: 'ข้อมูลที่จำเป็นไม่ครบถ้วน',
    //       ROW_INVALID_STATUS: 'สถานะไม่ถูกต้อง',
    //       ROW_NOT_FOUND: 'ไม่พบข้อมูลในระบบ',
    //     };
    //     return {
    //       inserted: response?.data?.inserted ?? 0,
    //       rows: errors.map((e, i) => ({
    //         no: e.rowNumber ?? i + 1,
    //         code: e.code ?? '',
    //         nameTh: e.labelTh ?? '',
    //         nameEn: e.labelEn ?? '',
    //         status: 'active' as const,
    //         remark: errorCodeToThai[e.errorCode] ?? e.errorMessage ?? e.errorCode,
    //         hasError: true,
    //       })),
    //     };
    //   };
    // Other errors → show review table

    return {
      inserted: response?.data?.inserted ?? 0,
      rows: errors.map((e, i) => ({
        no: e.rowNumber ?? i + 1,
        code: e.code ?? '',
        nameTh: e.labelTh ?? '',
        nameEn: e.labelEn ?? '',
        status: 'active' as const,
        remark: e.errorMessage,
        hasError: true,
      })),
    };
  };

  protected async onImportSuccess(): Promise<void> {
    this.state.closeImportModal();
    this.pageIndex = 1;
    await this.loadEntries();
  }

  protected onDownloadTemplate(): void {
    this.codexService.downloadTemplate(this.categoryId);
  }

  protected onDownloadData(): void {
    this.codexService.downloadData(this.categoryId);
  }

  addClick(): void {
    this.modalUpsertState.onOpen(this.categoryId, () => {
      void this.loadEntries();
      setTimeout(() => this.state.showToast('เพิ่มข้อมูลสำเร็จ'), 300);
    });
  }

  protected onEditClick(row: DataManagementRow): void {
    this.modalUpsertState.onOpenEdit(row, () => {
      void this.loadEntries();
      setTimeout(() => this.state.showToast('แก้ไขข้อมูลสำเร็จ'), 300);
    });
  }
}
