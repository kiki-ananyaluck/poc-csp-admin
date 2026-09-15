import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';
import { NavbarMainState } from './navbars-main.state';

type AuthPayload = {
  user?: {
    displayName?: string;
    avatarURL?: string;
  };
} | null;

describe('NavbarMainState', () => {
  let state: NavbarMainState;

  const mockAuthService = {
    user: signal<AuthPayload>(null),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NavbarMainState,
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    mockAuthService.user.set(null);
    state = TestBed.inject(NavbarMainState);
  });

  it('should create', () => {
    expect(state).toBeTruthy();
  });

  describe('userName', () => {
    it('should return default userName when user is null', () => {
      expect(state.userName()).toBe('User');
    });

    it('should return displayName from user', () => {
      mockAuthService.user.set({ user: { displayName: 'John Doe' } });
      expect(state.userName()).toBe('John Doe');
    });

    it('should fallback to default when displayName is missing', () => {
      mockAuthService.user.set({ user: {} });
      expect(state.userName()).toBe('User');
    });
  });

  describe('avatarUrl', () => {
    it('should return empty string when user is null', () => {
      expect(state.avatarUrl()).toBe('');
    });

    it('should return avatarURL from user', () => {
      mockAuthService.user.set({
        user: { avatarURL: 'https://example.com/avatar.png' },
      });
      expect(state.avatarUrl()).toBe('https://example.com/avatar.png');
    });

    it('should return empty string when avatarURL is missing', () => {
      mockAuthService.user.set({ user: {} });
      expect(state.avatarUrl()).toBe('');
    });
  });

  describe('isPanelOpen', () => {
    it('should default to false', () => {
      expect(state.isPanelOpen()).toBe(false);
    });

    it('should toggle from false to true', () => {
      state.togglePanel();
      expect(state.isPanelOpen()).toBe(true);
    });

    it('should toggle back to false', () => {
      state.togglePanel();
      state.togglePanel();
      expect(state.isPanelOpen()).toBe(false);
    });

    it('should close panel', () => {
      state.togglePanel();
      state.closePanel();
      expect(state.isPanelOpen()).toBe(false);
    });
  });
});
