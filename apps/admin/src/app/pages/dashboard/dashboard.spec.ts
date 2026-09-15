import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';
import { DASHBOARD_MESSAGES } from './dashboard.message';
import { DASHBOARD_SELECTORS } from './dashboard.selector';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose messages', () => {
    expect(component.messages).toEqual(DASHBOARD_MESSAGES);
  });

  it('should expose selectors', () => {
    expect(component.selectors).toEqual(DASHBOARD_SELECTORS);
  });

  it('should render container with correct data-testid', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${DASHBOARD_SELECTORS.CONTAINER}"]`,
    );
    expect(el).toBeTruthy();
  });

  it('should render title with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${DASHBOARD_SELECTORS.TITLE}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(DASHBOARD_MESSAGES.TITLE);
  });

  it('should render subtitle with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${DASHBOARD_SELECTORS.SUBTITLE}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(DASHBOARD_MESSAGES.SUBTITLE);
  });

  it('should render description with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${DASHBOARD_SELECTORS.DESCRIPTION}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(DASHBOARD_MESSAGES.DESCRIPTION);
  });
});
