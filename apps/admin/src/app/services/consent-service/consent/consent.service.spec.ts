import { ConsentService } from './consent.service';
import { CookieConsentState } from './consent.model';

const STORAGE_KEY = 'cookie_consent';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storedState(): CookieConsentState | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function freshService(): ConsentService {
  return new ConsentService();
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ConsentService — SA-1146', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ─── UUID generation ────────────────────────────────────────────────────────

  describe('UUID generation', () => {
    it('should generate a valid UUID v4 on saveCustomConsent', () => {
      const svc = freshService();
      svc.saveCustomConsent(['C0001', 'C0002']);
      const id = storedState()?.anonymousId ?? '';
      expect(id).toMatch(UUID_REGEX);
    });

    it('should NOT generate a new UUID on subsequent consent updates (reuse existing)', () => {
      const svc = freshService();
      svc.saveCustomConsent(['C0001', 'C0002']);
      const firstId = storedState()?.anonymousId;

      svc.saveCustomConsent(['C0001']);
      const secondId = storedState()?.anonymousId;

      expect(secondId).toBe(firstId); // AC4: UUID ถูกสร้างครั้งเดียว ไม่ generate ซ้ำ
    });
  });

  // ─── AC4: localStorage persistence ─────────────────────────────────────────

  describe('localStorage persistence (AC4)', () => {
    it('should persist anonymousId to localStorage after saveCustomConsent', () => {
      freshService().saveCustomConsent(['C0001']);
      expect(storedState()?.anonymousId).toMatch(UUID_REGEX);
    });

    it('should persist the given categories array', () => {
      freshService().saveCustomConsent(['C0001', 'C0002']);
      expect(storedState()?.categories).toEqual(['C0001', 'C0002']);
    });

    it('should persist consentedAt as a valid ISO date string', () => {
      freshService().saveCustomConsent(['C0001']);
      const ts = storedState()?.consentedAt ?? '';
      expect(() => new Date(ts).toISOString()).not.toThrow();
      expect(new Date(ts).toISOString()).toBe(ts);
    });

    it('should restore state after simulated page refresh', () => {
      // First "session"
      const svc1 = freshService();
      svc1.saveCustomConsent(['C0001', 'C0002']);
      const savedId = storedState()!.anonymousId;

      // Second "session" (simulates refresh — new instance reads localStorage)
      const svc2 = freshService();
      expect(svc2.hasConsented()).toBe(true);
      expect(svc2.consentState()?.anonymousId).toBe(savedId);
    });

    it('should restore categories after simulated refresh', () => {
      freshService().saveCustomConsent(['C0001', 'C0002']);

      const svc2 = freshService();
      expect(svc2.isCategoryAllowed('C0002')).toBe(true);
    });

    it('should NOT show banner after refresh when consent exists', () => {
      freshService().saveCustomConsent(['C0001']);
      expect(freshService().bannerVisible()).toBe(false);
    });
  });

  // ─── isCategoryAllowed ─────────────────────────────────────────────────────

  describe('isCategoryAllowed()', () => {
    it('should return true for a category present in the stored list', () => {
      const svc = freshService();
      svc.saveCustomConsent(['C0001', 'C0002']);
      expect(svc.isCategoryAllowed('C0002')).toBe(true);
    });

    it('should return false for a category NOT in the stored list', () => {
      const svc = freshService();
      svc.saveCustomConsent(['C0001']);
      expect(svc.isCategoryAllowed('C0002')).toBe(false);
    });
  });

  // ─── First-time visitor (no localStorage) ─────────────────────────────────

  describe('first-time visitor', () => {
    it('should show banner on first load (no localStorage)', () => {
      expect(freshService().bannerVisible()).toBe(true);
    });

    it('should have null consentState on first load', () => {
      expect(freshService().consentState()).toBeNull();
    });

    it('should allow C0001 (Strictly Necessary) by default — Privacy by Default', () => {
      expect(freshService().isCategoryAllowed('C0001')).toBe(true);
    });

    it('should deny optional categories by default (Privacy by Default — AC3)', () => {
      expect(freshService().isCategoryAllowed('C0002')).toBe(false);
      expect(freshService().isCategoryAllowed('C0004')).toBe(false);
    });
  });

  // ─── Corrupted / missing localStorage ─────────────────────────────────────

  describe('resilience', () => {
    it('should handle corrupted localStorage gracefully (show banner)', () => {
      localStorage.setItem(STORAGE_KEY, '{broken json{{');
      expect(freshService().bannerVisible()).toBe(true);
    });

    it('should handle missing anonymousId in stored object gracefully', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories: [] }));
      expect(freshService().bannerVisible()).toBe(true);
    });
  });
});
