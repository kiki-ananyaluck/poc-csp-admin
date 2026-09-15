import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@exim/auth-sdk';
import { UserProfilePanelComponent } from './user-profile-panel';

type AuthPayload = {
  user?: {
    displayName?: string;
    email?: string;
  };
} | null;

describe('UserProfilePanelComponent', () => {
  let component: UserProfilePanelComponent;
  let fixture: ComponentFixture<UserProfilePanelComponent>;

  const mockAuthService = {
    user: signal<AuthPayload>({
      user: { displayName: 'John Doe', email: 'john@example.com' },
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfilePanelComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display displayName from state', () => {
    const nameEl: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-panel__name',
    );
    expect(nameEl.textContent?.trim()).toBe('John Doe');
  });

  it('should display email from state', () => {
    const emailEl: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-panel__email',
    );
    expect(emailEl.textContent?.trim()).toBe('john@example.com');
  });

  it('should emit closed when menu item is clicked', () => {
    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const menu: HTMLElement = fixture.nativeElement.querySelector(
      '.user-profile-panel__menu',
    );
    menu.click();

    expect(closedSpy).toHaveBeenCalled();
  });
});
