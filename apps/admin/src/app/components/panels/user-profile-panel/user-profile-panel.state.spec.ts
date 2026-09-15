import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';
import { UserProfilePanelState } from './user-profile-panel.state';

type AuthPayload = {
  user?: {
    displayName?: string;
    email?: string;
  };
} | null;

describe('UserProfilePanelState', () => {
  let state: UserProfilePanelState;

  const mockAuthService = {
    user: signal<AuthPayload>(null),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserProfilePanelState,
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    mockAuthService.user.set(null);
    state = TestBed.inject(UserProfilePanelState);
  });

  it('should create', () => {
    expect(state).toBeTruthy();
  });

  it('should return default displayName when user is null', () => {
    expect(state.displayName()).toBe('User');
  });

  it('should return displayName from user', () => {
    mockAuthService.user.set({
      user: { displayName: 'John Doe', email: 'john@example.com' },
    });
    expect(state.displayName()).toBe('John Doe');
  });

  it('should fallback to default displayName when displayName is missing', () => {
    mockAuthService.user.set({ user: { email: 'john@example.com' } });
    expect(state.displayName()).toBe('User');
  });

  it('should return default email when user is null', () => {
    expect(state.email()).toBe('user@example.com');
  });

  it('should return email from user', () => {
    mockAuthService.user.set({
      user: { displayName: 'John Doe', email: 'john@example.com' },
    });
    expect(state.email()).toBe('john@example.com');
  });

  it('should fallback to default email when email is missing', () => {
    mockAuthService.user.set({ user: { displayName: 'John Doe' } });
    expect(state.email()).toBe('user@example.com');
  });
});
