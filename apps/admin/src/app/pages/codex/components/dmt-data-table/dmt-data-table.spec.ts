import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DmtDataTableComponent } from './dmt-data-table';
import { DataManagementRow } from '../../codex.types';

const mockRows: DataManagementRow[] = [
  { id: '1', no: 1, code: 'C1', name: 'N1', nameEn: 'E1', status: 'active', version: 1 },
  { id: '2', no: 2, code: 'C2', name: 'N2', nameEn: 'E2', status: 'inactive', version: 1 },
  { id: '3', no: 3, code: 'C3', name: 'N3', nameEn: 'E3', status: 'active', version: 1 },
];

/** Flush microtasks (resolved/rejected promises) */
const flushMicrotasks = () => new Promise<void>((r) => queueMicrotask(r));

describe('DmtDataTableComponent', () => {
  let component: DmtDataTableComponent;
  let fixture: ComponentFixture<DmtDataTableComponent>;

  beforeEach(async () => {
    jest.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [DmtDataTableComponent],
    })
      .overrideComponent(DmtDataTableComponent, {
        set: { template: '', styles: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DmtDataTableComponent);
    component = fixture.componentInstance;
    component.data = mockRows;
    component.total = 3;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkbox selection', () => {
    it('should check a single row', () => {
      (component as any).onCheckRow('1', true);
      expect((component as any).isChecked('1')).toBe(true);
      expect((component as any).isChecked('2')).toBe(false);
    });

    it('should uncheck a single row', () => {
      (component as any).onCheckRow('1', true);
      (component as any).onCheckRow('1', false);
      expect((component as any).isChecked('1')).toBe(false);
    });

    it('should set checkedAll when all rows are checked', () => {
      (component as any).onCheckRow('1', true);
      (component as any).onCheckRow('2', true);
      (component as any).onCheckRow('3', true);
      expect((component as any).checkedAll()).toBe(true);
    });

    it('should check all rows via onCheckAll', () => {
      (component as any).onCheckAll(true);
      expect((component as any).checkedIds().size).toBe(3);
      expect((component as any).checkedAll()).toBe(true);
    });

    it('should uncheck all rows via onCheckAll', () => {
      (component as any).onCheckAll(true);
      (component as any).onCheckAll(false);
      expect((component as any).checkedIds().size).toBe(0);
      expect((component as any).checkedAll()).toBe(false);
    });

    it('should set indeterminate when some rows are checked', () => {
      (component as any).onCheckRow('1', true);
      expect((component as any).indeterminate()).toBe(true);
      expect((component as any).checkedAll()).toBe(false);
    });
  });

  describe('headerCheckboxConfig', () => {
    it('should always return indeterminate false', () => {
      (component as any).onCheckRow('1', true);
      expect((component as any).headerCheckboxConfig.indeterminate).toBe(false);
    });
  });

  describe('onRowDeleteClick', () => {
    it('should open delete modal with pending row', () => {
      const row = mockRows[0];
      (component as any).onRowDeleteClick(row);
      expect((component as any).isDeleteModalOpen()).toBe(true);
    });
  });

  describe('onBulkDeleteClick', () => {
    it('should open delete modal without pending row', () => {
      (component as any).onBulkDeleteClick();
      expect((component as any).isDeleteModalOpen()).toBe(true);
    });
  });

  describe('executeDelete', () => {
    it('should call deleteHandler and show success on resolve', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      component.deleteHandler = handler;
      (component as any).onRowDeleteClick(mockRows[0]);

      const promise = (component as any).executeDelete();
      await promise;
      jest.advanceTimersByTime(500);

      expect(handler).toHaveBeenCalledWith(['1']);
      expect((component as any).isDeleteModalOpen()).toBe(false);
      expect((component as any).showDeleteSuccess()).toBe(true);
      expect((component as any).deleteIsLoading()).toBe(false);
    });

    it('should show error on reject', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('fail'));
      component.deleteHandler = handler;
      (component as any).onRowDeleteClick(mockRows[0]);

      const promise = (component as any).executeDelete();
      await promise;
      jest.advanceTimersByTime(500);

      expect((component as any).isDeleteModalOpen()).toBe(false);
      expect((component as any).showDeleteError()).toBe(true);
      expect((component as any).deleteIsLoading()).toBe(false);
    });

    it('should do nothing if deleteHandler is null', async () => {
      component.deleteHandler = null;
      await (component as any).executeDelete();
      expect((component as any).isDeleteModalOpen()).toBe(false);
    });

    it('should clear checkedIds on bulk delete success', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      component.deleteHandler = handler;
      (component as any).onCheckAll(true);
      (component as any).onBulkDeleteClick();

      await (component as any).executeDelete();
      jest.advanceTimersByTime(500);

      expect((component as any).checkedIds().size).toBe(0);
    });

    it('should set deleteIsLoading to true during execution', async () => {
      let resolveHandler!: () => void;
      const handler = jest.fn().mockImplementation(
        () => new Promise<void>((r) => { resolveHandler = r; }),
      );
      component.deleteHandler = handler;
      (component as any).onRowDeleteClick(mockRows[0]);

      const promise = (component as any).executeDelete();
      expect((component as any).deleteIsLoading()).toBe(true);

      resolveHandler();
      await promise;
      expect((component as any).deleteIsLoading()).toBe(false);
    });
  });

  describe('onPageChange', () => {
    it('should emit pageChange with number input', () => {
      const spy = jest.spyOn(component.pageChange, 'emit');
      (component as any).onPageChange(3);
      expect(spy).toHaveBeenCalledWith({ pageIndex: 3, pageSize: 10 });
    });

    it('should emit pageChange with object input', () => {
      const spy = jest.spyOn(component.pageChange, 'emit');
      (component as any).onPageChange({ pageIndex: 2, pageSize: 20 });
      expect(spy).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 20 });
    });
  });

  describe('onPageSizeChange', () => {
    it('should emit pageChange with new size and reset to page 1', () => {
      const spy = jest.spyOn(component.pageChange, 'emit');
      (component as any).onPageSizeChange(50);
      expect(spy).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 50 });
    });

    it('should handle object input', () => {
      const spy = jest.spyOn(component.pageChange, 'emit');
      (component as any).onPageSizeChange({ pageSize: 20 });
      expect(spy).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
    });
  });

  describe('onColumnSort', () => {
    it('should emit sortChange for valid column', () => {
      const spy = jest.spyOn(component.sortChange, 'emit');
      (component as any).onColumnSort({ key: 'code', value: 'ascend' });
      jest.advanceTimersByTime(0);
      expect(spy).toHaveBeenCalledWith({ field: 'code', order: 'ascend' });
    });

    it('should not emit sortChange for unknown column', () => {
      const spy = jest.spyOn(component.sortChange, 'emit');
      (component as any).onColumnSort({ key: 'unknown', value: 'ascend' });
      jest.advanceTimersByTime(0);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should reset all sort orders except the active one', () => {
      (component as any).sortOrders['code'] = 'ascend';
      (component as any).onColumnSort({ key: 'name', value: 'descend' });
      jest.advanceTimersByTime(0);
      expect((component as any).sortOrders['code']).toBeNull();
      expect((component as any).sortOrders['name']).toBe('descend');
    });

    it('should map name field to label:th-TH', () => {
      const spy = jest.spyOn(component.sortChange, 'emit');
      (component as any).onColumnSort({ key: 'name', value: 'ascend' });
      jest.advanceTimersByTime(0);
      expect(spy).toHaveBeenCalledWith({ field: 'label:th-TH', order: 'ascend' });
    });

    it('should map nameEn field to label:en-EN', () => {
      const spy = jest.spyOn(component.sortChange, 'emit');
      (component as any).onColumnSort({ key: 'nameEn', value: 'descend' });
      jest.advanceTimersByTime(0);
      expect(spy).toHaveBeenCalledWith({ field: 'label:en-EN', order: 'descend' });
    });

    it('should handle null sort value', () => {
      const spy = jest.spyOn(component.sortChange, 'emit');
      (component as any).onColumnSort({ key: 'code', value: null });
      jest.advanceTimersByTime(0);
      expect(spy).toHaveBeenCalledWith({ field: 'code', order: null });
    });
  });

  describe('onDismissDeleteSuccess', () => {
    it('should hide success toast', () => {
      (component as any).showDeleteSuccess.set(true);
      (component as any).onDismissDeleteSuccess();
      expect((component as any).showDeleteSuccess()).toBe(false);
    });
  });

  describe('deleteModalCancelBtn', () => {
    it('should close modal and clear pending row', () => {
      (component as any).isDeleteModalOpen.set(true);
      (component as any).deleteModalCancelBtn.action();
      expect((component as any).isDeleteModalOpen()).toBe(false);
    });
  });

  describe('deleteModalConfirmBtn', () => {
    it('should trigger executeDelete via action', () => {
      const spy = jest.spyOn(component as any, 'executeDelete').mockResolvedValue(undefined);
      (component as any).deleteModalConfirmBtn.action();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onAllCheckedFromTable', () => {
    it('should delegate to onCheckAll', () => {
      (component as any).onAllCheckedFromTable({ key: 'all', value: true });
      expect((component as any).checkedAll()).toBe(true);
      expect((component as any).checkedIds().size).toBe(3);
    });
  });
});
