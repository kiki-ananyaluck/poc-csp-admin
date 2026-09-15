import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DmtSearchFilterComponent } from './dmt-search-filter';
import { FilterValue } from '../../codex.types';

describe('DmtSearchFilterComponent', () => {
  let component: DmtSearchFilterComponent;
  let fixture: ComponentFixture<DmtSearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmtSearchFilterComponent],
    })
      .overrideComponent(DmtSearchFilterComponent, {
        set: { template: '', styleUrls: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DmtSearchFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasActiveFilter', () => {
    it('should return false when no filters applied', () => {
      component.appliedStatusActive = false;
      component.appliedStatusInactive = false;
      expect((component as any).hasActiveFilter).toBe(false);
    });

    it('should return true when active filter is applied', () => {
      component.appliedStatusActive = true;
      expect((component as any).hasActiveFilter).toBe(true);
    });

    it('should return true when inactive filter is applied', () => {
      component.appliedStatusInactive = true;
      expect((component as any).hasActiveFilter).toBe(true);
    });
  });

  describe('onSearchInput', () => {
    it('should emit searchChange with the value', () => {
      const spy = jest.spyOn(component.searchChange, 'emit');
      (component as any).onSearchInput('keyword');
      expect(spy).toHaveBeenCalledWith('keyword');
    });
  });

  describe('toggleFilterPanel', () => {
    it('should open filter panel and sync pending values', () => {
      component.appliedStatusActive = true;
      component.appliedStatusInactive = false;

      (component as any).toggleFilterPanel();

      expect((component as any).isFilterPanelOpen()).toBe(true);
      expect((component as any).pendingStatusActive()).toBe(true);
      expect((component as any).pendingStatusInactive()).toBe(false);
    });

    it('should close filter panel when already open', () => {
      (component as any).isFilterPanelOpen.set(true);
      (component as any).toggleFilterPanel();
      expect((component as any).isFilterPanelOpen()).toBe(false);
    });
  });

  describe('onFilterClear', () => {
    it('should reset pending values', () => {
      (component as any).pendingStatusActive.set(true);
      (component as any).pendingStatusInactive.set(true);

      (component as any).onFilterClear();

      expect((component as any).pendingStatusActive()).toBe(false);
      expect((component as any).pendingStatusInactive()).toBe(false);
    });
  });

  describe('onFilterCancel', () => {
    it('should close filter panel', () => {
      (component as any).isFilterPanelOpen.set(true);
      (component as any).onFilterCancel();
      expect((component as any).isFilterPanelOpen()).toBe(false);
    });
  });

  describe('onFilterApply', () => {
    it('should emit filterApply with pending values and close panel', () => {
      const spy = jest.spyOn(component.filterApply, 'emit');

      (component as any).pendingStatusActive.set(true);
      (component as any).pendingStatusInactive.set(false);
      (component as any).isFilterPanelOpen.set(true);

      (component as any).onFilterApply();

      expect(spy).toHaveBeenCalledWith({
        statusActive: true,
        statusInactive: false,
      } as FilterValue);
      expect((component as any).isFilterPanelOpen()).toBe(false);
    });
  });

  describe('onDocumentClick', () => {
    it('should close filter panel when clicking outside', () => {
      (component as any).isFilterPanelOpen.set(true);
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      component.onDocumentClick(outsideElement);

      expect((component as any).isFilterPanelOpen()).toBe(false);
      document.body.removeChild(outsideElement);
    });
  });
});
