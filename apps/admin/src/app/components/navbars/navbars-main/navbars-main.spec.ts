import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@exim/auth-sdk';
import { NavbarMainComponent } from './navbars-main';
import { NavbarMainState } from './navbars-main.state';

type AuthPayload = {
  user?: {
    displayName?: string;
  };
} | null;

describe('NavbarMainComponent', () => {
  let component: NavbarMainComponent;
  let fixture: ComponentFixture<NavbarMainComponent>;
  let state: NavbarMainState;

  const mockAuthService = {
    user: signal<AuthPayload>({ user: { displayName: 'John Doe' } }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMainComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarMainComponent);
    component = fixture.componentInstance;
    state = TestBed.inject(NavbarMainState);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display userName from state', () => {
    const nameEl: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-box__name',
    );
    expect(nameEl.textContent?.trim()).toBe('John Doe');
  });

  it('should open panel on avatar click', () => {
    const avatar: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-box__avatar',
    );
    avatar.click();
    fixture.detectChanges();
    expect(state.isPanelOpen()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.navbar-main__panel'),
    ).toBeTruthy();
  });

  it('should close panel on second avatar click', () => {
    const avatar: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-box__avatar',
    );
    avatar.click();
    avatar.click();
    fixture.detectChanges();
    expect(state.isPanelOpen()).toBe(false);
    expect(
      fixture.nativeElement.querySelector('.navbar-main__panel'),
    ).toBeFalsy();
  });

  it('should close panel on document click outside', () => {
    state.togglePanel();
    fixture.detectChanges();

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(state.isPanelOpen()).toBe(false);
  });
});
