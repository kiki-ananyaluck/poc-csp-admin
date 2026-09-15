import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ScriptInjectionService } from './script-injection.service';
import { ConsentService } from '../consent-service/consent/consent.service';
import { ConsentCategory } from '../consent-service/consent/consent.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simulate script load/error by triggering the event on the last appended <script> */
function triggerScriptEvent(doc: Document, event: 'load' | 'error'): void {
  const scripts = doc.head.querySelectorAll('script[src]');
  const last = scripts[scripts.length - 1] as HTMLScriptElement;
  last?.dispatchEvent(new Event(event));
}

// ─── Setup ────────────────────────────────────────────────────────────────────

describe('ScriptInjectionService', () => {
  let service: ScriptInjectionService;
  let doc: Document;

  const mockConsentService = {
    isCategoryAllowed: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScriptInjectionService,
        { provide: ConsentService, useValue: mockConsentService },
      ],
    });

    service = TestBed.inject(ScriptInjectionService);
    doc = TestBed.inject(DOCUMENT);

    // Clean <head> between tests
    doc.head.querySelectorAll('script[src]').forEach((s) => s.remove());
    jest.clearAllMocks();
  });

  // ─── AC: inject ได้ ─────────────────────────────────────────────────────────

  describe('loadScript(src)', () => {
    it('should append a <script> tag into <head>', async () => {
      const SRC = 'https://example.com/lib.js';
      const promise = service.loadScript(SRC);
      triggerScriptEvent(doc, 'load');
      await promise;

      const scripts = doc.head.querySelectorAll<HTMLScriptElement>(
        `script[src="${SRC}"]`,
      );
      expect(scripts.length).toBe(1);
      expect(scripts[0].async).toBe(true);
      expect(scripts[0].type).toBe('text/javascript');
    });

    it('should set async=false when specified (e.g. OneTrust scripts)', async () => {
      const SRC = 'https://cdn.cookielaw.org/consent/xxx/OtAutoBlock.js';
      const promise = service.loadScript(SRC, undefined, false);
      triggerScriptEvent(doc, 'load');
      await promise;

      const script = doc.head.querySelector<HTMLScriptElement>(
        `script[src="${SRC}"]`,
      );
      expect(script?.async).toBe(false);
    });

    it('should set src attribute correctly', async () => {
      const SRC = 'https://example.com/tracker.js';
      const promise = service.loadScript(SRC);
      triggerScriptEvent(doc, 'load');
      await promise;

      const script = doc.head.querySelector<HTMLScriptElement>(
        `script[src="${SRC}"]`,
      );
      expect(script?.src).toContain(SRC);
    });

    it('should set extra attributes if provided', async () => {
      const SRC = 'https://example.com/widget.js';
      const promise = service.loadScript(SRC, {
        'data-id': 'abc123',
        crossorigin: 'anonymous',
      });
      triggerScriptEvent(doc, 'load');
      await promise;

      const script = doc.head.querySelector<HTMLScriptElement>(
        `script[src="${SRC}"]`,
      );
      expect(script?.getAttribute('data-id')).toBe('abc123');
      expect(script?.getAttribute('crossorigin')).toBe('anonymous');
    });

    it('should resolve the Promise on successful load', async () => {
      const promise = service.loadScript('https://example.com/ok.js');
      triggerScriptEvent(doc, 'load');
      await expect(promise).resolves.toBeUndefined();
    });

    it('should reject the Promise on load error', async () => {
      const SRC = 'https://example.com/fail.js';
      const promise = service.loadScript(SRC);
      triggerScriptEvent(doc, 'error');
      await expect(promise).rejects.toThrow(`failed to load "${SRC}"`);
    });
  });

  // ─── AC: handle duplicate ────────────────────────────────────────────────────

  describe('duplicate prevention', () => {
    it('should NOT inject the same <script> twice', async () => {
      const SRC = 'https://example.com/analytics.js';

      const p1 = service.loadScript(SRC);
      triggerScriptEvent(doc, 'load');
      await p1;

      const p2 = service.loadScript(SRC);
      await p2;

      const scripts = doc.head.querySelectorAll(`script[src="${SRC}"]`);
      expect(scripts.length).toBe(1);
    });

    it('should return the SAME Promise for duplicate calls', () => {
      const SRC = 'https://example.com/same.js';
      const p1 = service.loadScript(SRC);
      const p2 = service.loadScript(SRC);
      expect(p1).toBe(p2);
    });

    it('should return the same Promise even while the script is still loading', () => {
      const SRC = 'https://example.com/inflight.js';
      const p1 = service.loadScript(SRC);
      // intentionally NOT triggering load — script still in-flight
      const p2 = service.loadScript(SRC);
      expect(p1).toBe(p2);
    });
  });

  // ─── AC: injectAllowedScripts ─────────────────────────────────────────────

  describe('injectAllowedScripts()', () => {
    it('should load script when consent category is allowed', () => {
      mockConsentService.isCategoryAllowed.mockReturnValue(true);
      service.registerScripts([
        {
          src: 'https://example.com/gtm.js',
          category: ConsentCategory.MARKETING,
        },
      ]);

      service.injectAllowedScripts();

      const script = doc.head.querySelector(
        'script[src="https://example.com/gtm.js"]',
      );
      expect(script).not.toBeNull();
    });

    it('should NOT load script when consent category is denied', () => {
      mockConsentService.isCategoryAllowed.mockReturnValue(false);
      service.registerScripts([
        {
          src: 'https://example.com/gtm.js',
          category: ConsentCategory.MARKETING,
        },
      ]);

      service.injectAllowedScripts();

      const script = doc.head.querySelector(
        'script[src="https://example.com/gtm.js"]',
      );
      expect(script).toBeNull();
    });

    it('should NOT re-inject an already-loaded script on repeated calls', async () => {
      mockConsentService.isCategoryAllowed.mockReturnValue(true);
      const SRC = 'https://example.com/ai.js';
      service.registerScripts([
        { src: SRC, category: ConsentCategory.ANALYTICS },
      ]);

      // First call
      service.injectAllowedScripts();
      triggerScriptEvent(doc, 'load');

      // Second call
      service.injectAllowedScripts();

      const scripts = doc.head.querySelectorAll(`script[src="${SRC}"]`);
      expect(scripts.length).toBe(1);
    });

    it('should NOT throw when a script fails to load', () => {
      mockConsentService.isCategoryAllowed.mockReturnValue(true);
      service.registerScripts([
        {
          src: 'https://example.com/fail.js',
          category: ConsentCategory.ANALYTICS,
        },
      ]);

      expect(() => {
        service.injectAllowedScripts();
        triggerScriptEvent(doc, 'error');
      }).not.toThrow();
    });
  });
});
