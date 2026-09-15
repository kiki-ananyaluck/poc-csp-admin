import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { HOME_MESSAGES } from './home.message';
import { HOME_SELECTORS } from './home.selector';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose messages', () => {
    expect(component.messages).toEqual(HOME_MESSAGES);
  });

  it('should expose selectors', () => {
    expect(component.selectors).toEqual(HOME_SELECTORS);
  });

  it('should render container with correct data-testid', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${HOME_SELECTORS.CONTAINER}"]`,
    );
    expect(el).toBeTruthy();
  });

  it('should render title with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${HOME_SELECTORS.TITLE}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(HOME_MESSAGES.TITLE);
  });

  it('should render subtitle with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${HOME_SELECTORS.SUBTITLE}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(HOME_MESSAGES.SUBTITLE);
  });

  it('should render description with correct text', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector(
      `[data-testid="${HOME_SELECTORS.DESCRIPTION}"]`,
    );
    expect(el).toBeTruthy();
    expect(el.textContent?.trim()).toContain(HOME_MESSAGES.DESCRIPTION);
  });
});
