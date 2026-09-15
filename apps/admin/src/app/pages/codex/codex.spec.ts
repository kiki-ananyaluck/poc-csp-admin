import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { Codex } from './codex';
import { CodexState } from './codex.state';
import { CodexService } from '../../services/codex-service/codex.service';
import { ModalUpsertCodexState } from './components/modal-upsert/modal-upsert.state';

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

// ── Stubs ────────────────────────────────────────────────────────────────────
const mockCodexService = {
  getCategories: jest.fn(),
  getEntries: jest.fn(),
  deleteEntry: jest.fn(),
  importEntries: jest.fn(),
  downloadTemplate: jest.fn(),
  downloadData: jest.fn(),
};

const paramMapSubject = new Subject<Map<string, string>>();
const mockActivatedRoute = {
  paramMap: paramMapSubject.asObservable(),
};

const mockModalUpsertState = {
  onOpen: jest.fn(),
  onOpenEdit: jest.fn(),
  isOpenModal: jest.fn(() => false),
  isLoading: jest.fn(() => false),
  mode: jest.fn(() => 'create'),
  editCode: jest.fn(() => ''),
  bankForm: { reset: jest.fn() },
};

function makeEntriesResponse(items: unknown[] = [], totalCount = 0) {
  return {
    data: {
      items,
      pagination: { totalCount, pageNumber: 1, pageSize: 10, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
  };
}

function makeCategoriesResponse(nameTH = 'ทดสอบ') {
  return { data: { nameTH } };
}

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    code: 'CODE-001',
    categoryId: '1',
    companyId: null,
    parentEntryId: null,
    level: 0,
    sortOrder: 1,
    isActive: true,
    version: 1,
    label: 'Entry 1',
    description: '',
    metadata: null,
    localizations: [
      { locale: 'th-TH', label: 'รายการ 1', description: '' },
      { locale: 'en-EN', label: 'Entry 1', description: '' },
    ],
    ...overrides,
  };
}

describe('Codex', () => {
  let component: Codex;
  let fixture: ComponentFixture<Codex>;
  let state: CodexState;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCodexService.getCategories.mockResolvedValue(makeCategoriesResponse());
    mockCodexService.getEntries.mockResolvedValue(makeEntriesResponse());

    await TestBed.configureTestingModule({
      imports: [Codex],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: CodexService, useValue: mockCodexService },
        { provide: ModalUpsertCodexState, useValue: mockModalUpsertState },
      ],
    })
      .overrideComponent(Codex, {
        set: {
          template: '',
          styles: [],
          providers: [
            { provide: ModalUpsertCodexState, useValue: mockModalUpsertState },
            CodexState,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Codex);
    component = fixture.componentInstance;
    state = component.state;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load category and entries when route param emits', async () => {
      component.ngOnInit();
      const params = new Map<string, string>();
      params.set('id', '5');
      paramMapSubject.next(params);
      await flush();

      expect(mockCodexService.getCategories).toHaveBeenCalledWith('5');
      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: '5', pageNumber: 1, pageSize: 10 }),
      );
    });

    it('should default to categoryId "1" when route param is missing', async () => {
      component.ngOnInit();
      const params = new Map<string, string>();
      paramMapSubject.next(params);
      await flush();

      expect(mockCodexService.getCategories).toHaveBeenCalledWith('1');
    });
  });

  describe('onSearchChange', () => {
    it('should reload entries with search keyword and reset page', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onSearchChange('test');
      await flush();

      expect(state.hasUserInteracted()).toBe(true);
      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test', pageNumber: 1 }),
      );
    });
  });

  describe('onSortChange', () => {
    it('should not emit when hasUserInteracted is false', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onSortChange({ field: 'code', order: 'ascend' });
      await flush();

      expect(mockCodexService.getEntries).not.toHaveBeenCalled();
    });

    it('should reload entries with sort when hasUserInteracted', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      state.setHasUserInteracted(true);
      mockCodexService.getEntries.mockClear();

      (component as any).onSortChange({ field: 'code', order: 'ascend' });
      await flush();

      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'code', sortOrder: 'ASC' }),
      );
    });

    it('should clear sort when order is null', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      state.setHasUserInteracted(true);

      // First set a sort so the state changes
      (component as any).onSortChange({ field: 'code', order: 'ascend' });
      await flush();
      mockCodexService.getEntries.mockClear();

      // Then clear it
      (component as any).onSortChange({ field: 'code', order: null });
      await flush();

      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: undefined, sortOrder: undefined }),
      );
    });
  });

  describe('onTablePageChange', () => {
    it('should reload entries on page change', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onTablePageChange({ pageIndex: 3, pageSize: 10 });
      await flush();

      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ pageNumber: 3, pageSize: 10 }),
      );
    });

    it('should not reload when page and size are the same', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onTablePageChange({ pageIndex: 1, pageSize: 10 });
      await flush();

      expect(mockCodexService.getEntries).not.toHaveBeenCalled();
    });
  });

  describe('onFilterApply', () => {
    it('should set isActive=true when only active is selected', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onFilterApply({ statusActive: true, statusInactive: false });
      await flush();

      expect(state.appliedStatusActive()).toBe(true);
      expect(state.appliedStatusInactive()).toBe(false);
      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should set isActive=false when only inactive is selected', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onFilterApply({ statusActive: false, statusInactive: true });
      await flush();

      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should set isActive=undefined when both or neither selected', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      (component as any).onFilterApply({ statusActive: true, statusInactive: true });
      await flush();

      expect(mockCodexService.getEntries).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: undefined }),
      );
    });
  });

  describe('onRemoveChip', () => {
    it('should remove active chip and reapply filter', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();

      state.setAppliedStatusActive(true);
      state.setAppliedStatusInactive(true);
      mockCodexService.getEntries.mockClear();

      (component as any).onRemoveChip('active');
      await flush();

      expect(state.appliedStatusActive()).toBe(false);
      expect(state.appliedStatusInactive()).toBe(true);
    });

    it('should remove inactive chip and reapply filter', async () => {
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();

      state.setAppliedStatusActive(true);
      state.setAppliedStatusInactive(true);
      mockCodexService.getEntries.mockClear();

      (component as any).onRemoveChip('inactive');
      await flush();

      expect(state.appliedStatusInactive()).toBe(false);
      expect(state.appliedStatusActive()).toBe(true);
    });
  });

  describe('deleteHandler', () => {
    it('should call deleteEntry for each id and reload', async () => {
      mockCodexService.deleteEntry.mockResolvedValue({});
      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();
      mockCodexService.getEntries.mockClear();

      await (component as any).deleteHandler(['id-1', 'id-2']);
      await flush();

      expect(mockCodexService.deleteEntry).toHaveBeenCalledTimes(2);
      expect(mockCodexService.deleteEntry).toHaveBeenCalledWith('id-1');
      expect(mockCodexService.deleteEntry).toHaveBeenCalledWith('id-2');
      expect(mockCodexService.getEntries).toHaveBeenCalled();
    });
  });

  describe('loadEntries', () => {
    it('should map entries to rows correctly', async () => {
      const entry = makeEntry({ isActive: false });
      mockCodexService.getEntries.mockResolvedValue(
        makeEntriesResponse([entry], 1),
      );

      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();

      const rows = state.rows();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual(
        expect.objectContaining({
          id: '1',
          no: 1,
          code: 'CODE-001',
          name: 'รายการ 1',
          nameEn: 'Entry 1',
          status: 'inactive',
        }),
      );
    });

    it('should set loading false on API error', async () => {
      mockCodexService.getEntries.mockRejectedValue(new Error('fail'));

      component.ngOnInit();
      const params = new Map([['id', '1']]);
      paramMapSubject.next(params);
      await flush();

      expect(state.loading()).toBe(false);
    });
  });

  describe('addClick / onEditClick', () => {
    it('should call modalUpsertState.onOpen on addClick', async () => {
      component.ngOnInit();
      const params = new Map([['id', '2']]);
      paramMapSubject.next(params);
      await flush();

      component.addClick();
      expect(mockModalUpsertState.onOpen).toHaveBeenCalledWith('2', expect.any(Function));
    });

    it('should call modalUpsertState.onOpenEdit on editClick', async () => {
      const row = { id: '1', no: 1, code: 'C', name: 'N', nameEn: 'N', status: 'active' as const, version: 1 };
      (component as any).onEditClick(row);
      expect(mockModalUpsertState.onOpenEdit).toHaveBeenCalledWith(
        row,
        expect.any(Function),
      );
    });
  });

  describe('onDownloadTemplate / onDownloadData', () => {
    it('should call codexService.downloadTemplate', async () => {
      component.ngOnInit();
      const params = new Map([['id', '3']]);
      paramMapSubject.next(params);
      await flush();

      (component as any).onDownloadTemplate();
      expect(mockCodexService.downloadTemplate).toHaveBeenCalledWith('3');
    });

    it('should call codexService.downloadData', async () => {
      component.ngOnInit();
      const params = new Map([['id', '3']]);
      paramMapSubject.next(params);
      await flush();

      (component as any).onDownloadData();
      expect(mockCodexService.downloadData).toHaveBeenCalledWith('3');
    });
  });
});
