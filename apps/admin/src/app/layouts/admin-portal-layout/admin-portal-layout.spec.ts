import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AdminPortalLayout } from './admin-portal-layout';

describe('AdminPortalLayout', () => {
  let component: AdminPortalLayout;
  let fixture: ComponentFixture<AdminPortalLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPortalLayout, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortalLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle collapsed state', () => {
    expect(component.isCollapsed()).toBe(false);
    component.toggleCollapsed();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should show correct trigger icon', () => {
    expect(component.triggerIcon()).toBe('menu-fold');
    component.toggleCollapsed();
    expect(component.triggerIcon()).toBe('menu-unfold');
  });
});
