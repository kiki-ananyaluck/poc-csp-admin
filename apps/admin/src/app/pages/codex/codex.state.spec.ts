import { CodexState } from './codex.state';
import { DataManagementRow } from './codex.types';

describe('CodexState', () => {
  let state: CodexState;

  const mockRow: DataManagementRow = {
    id: '1',
    no: 1,
    code: 'CODE-001',
    name: 'Test',
    nameEn: 'Test EN',
    status: 'active',
    version: 1,
  };

  beforeEach(() => {
    state = new CodexState();
  });

  describe('initial values', () => {
    it('should have empty rows', () => {
      expect(state.rows()).toEqual([]);
    });

    it('should have total = 0', () => {
      expect(state.total()).toBe(0);
    });

    it('should have loading = false', () => {
      expect(state.loading()).toBe(false);
    });

    it('should have importNetworkError = false', () => {
      expect(state.importNetworkError()).toBe(false);
    });

    it('should have isImportModalOpen = false', () => {
      expect(state.isImportModalOpen()).toBe(false);
    });

    it('should have appliedStatusActive = false', () => {
      expect(state.appliedStatusActive()).toBe(false);
    });

    it('should have appliedStatusInactive = false', () => {
      expect(state.appliedStatusInactive()).toBe(false);
    });

    it('should have showSuccessToast = false', () => {
      expect(state.showSuccessToast()).toBe(false);
    });

    it('should have empty toastMessage', () => {
      expect(state.toastMessage()).toBe('');
    });

    it('should have hasUserInteracted = false', () => {
      expect(state.hasUserInteracted()).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      state.setLoading(true);
      expect(state.loading()).toBe(true);
    });

    it('should set loading to false', () => {
      state.setLoading(true);
      state.setLoading(false);
      expect(state.loading()).toBe(false);
    });
  });

  describe('setRows', () => {
    it('should set rows', () => {
      state.setRows([mockRow]);
      expect(state.rows()).toEqual([mockRow]);
    });

    it('should replace existing rows', () => {
      state.setRows([mockRow]);
      state.setRows([]);
      expect(state.rows()).toEqual([]);
    });
  });

  describe('setTotal', () => {
    it('should set total', () => {
      state.setTotal(42);
      expect(state.total()).toBe(42);
    });
  });

  describe('setHasUserInteracted', () => {
    it('should set hasUserInteracted', () => {
      state.setHasUserInteracted(true);
      expect(state.hasUserInteracted()).toBe(true);
    });
  });

  describe('setAppliedStatusActive / setAppliedStatusInactive', () => {
    it('should set appliedStatusActive', () => {
      state.setAppliedStatusActive(true);
      expect(state.appliedStatusActive()).toBe(true);
    });

    it('should set appliedStatusInactive', () => {
      state.setAppliedStatusInactive(true);
      expect(state.appliedStatusInactive()).toBe(true);
    });
  });

  describe('import modal', () => {
    it('should open import modal', () => {
      state.openImportModal();
      expect(state.isImportModalOpen()).toBe(true);
    });

    it('should close import modal', () => {
      state.openImportModal();
      state.closeImportModal();
      expect(state.isImportModalOpen()).toBe(false);
    });
  });

  describe('toast', () => {
    it('should show toast with message', () => {
      state.showToast('สำเร็จ');
      expect(state.showSuccessToast()).toBe(true);
      expect(state.toastMessage()).toBe('สำเร็จ');
    });

    it('should dismiss toast', () => {
      state.showToast('สำเร็จ');
      state.dismissToast();
      expect(state.showSuccessToast()).toBe(false);
    });
  });
});
