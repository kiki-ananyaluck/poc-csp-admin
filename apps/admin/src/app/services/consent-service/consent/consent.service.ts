import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { CookieConsentState } from './consent.model';
import { ConsentCategory } from './consent.config';

const STORAGE_KEY = 'cookie_consent';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly document = inject(DOCUMENT);
  private readonly _consentState = signal<CookieConsentState | null>(null);
  private readonly _bannerVisible = signal(false);
  private readonly loadedScripts = new Set<string>();

  readonly consentState = this._consentState.asReadonly();
  readonly bannerVisible = this._bannerVisible.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  hasConsented(): boolean {
    return this._consentState() !== null;
  }

  isCategoryAllowed(category: string): boolean {
    const state = this._consentState();
    if (!state) return category === 'C0001'; // C0001 = Strictly Necessary (always allowed)
    return state.categories.includes(category);
  }

  // acceptAll(): void {
  //   this.saveState({
  //     anonymousId: this.getOrCreateAnonymousId(),
  //     consentedAt: new Date().toISOString(),
  //     categories: {
  //       [ConsentCategory.STRICTLY_NECESSARY]: true,
  //       [ConsentCategory.ANALYTICS]: true,
  //       [ConsentCategory.MARKETING]: true,
  //     },
  //   });
  // }

  // rejectAll(): void {
  //   this.saveState({
  //     anonymousId: this.getOrCreateAnonymousId(),
  //     consentedAt: new Date().toISOString(),
  //     categories: {
  //       [ConsentCategory.STRICTLY_NECESSARY]: true,
  //       [ConsentCategory.ANALYTICS]: false,
  //       [ConsentCategory.MARKETING]: false,
  //     },
  //   });
  // }

  saveCustomConsent(categories: string[]): void {
    this.saveState({
      anonymousId: this.getOrCreateAnonymousId(),
      consentedAt: new Date().toISOString(),
      categories: [...categories],
    });
  }

  private saveState(state: CookieConsentState): void {
    this._consentState.set(state);
    this._bannerVisible.set(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable (e.g. SSR)
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      console.log('[CookieConsent] Raw localStorage:', raw);
      if (raw) {
        const parsed: CookieConsentState = JSON.parse(raw);
        console.log('[CookieConsent] Parsed state:', parsed);
        if (parsed?.anonymousId && parsed?.categories) {
          this._consentState.set(parsed);
          this._bannerVisible.set(false);
          // โหลด scripts ตาม categories ที่ user เคยยินยอมไว้
          this.loadScriptsByCategories(parsed.categories);
          return;
        }
      }
    } catch (e) {
      console.error('[CookieConsent] Error loading from storage:', e);
      // corrupted or unavailable
    }
    this._bannerVisible.set(true);
  }

  /**
   * โหลด mock scripts ตาม categories ที่ได้รับ consent
   * เช่น categories = ['C0001', 'C0017'] → โหลด /mock-script/C0001.js, /mock-script/C0017.js
   */
  loadScriptsByCategories(categories: string[]): void {
    console.log('[CookieConsent] Loading scripts for categories:', categories);
    for (const category of categories) {
      const scriptFile =
        ConsentCategory[category as keyof typeof ConsentCategory];
      console.log(
        `[CookieConsent] Category: ${category}, ScriptFile: ${scriptFile}`,
      );
      if (scriptFile && !this.loadedScripts.has(category)) {
        const src = `/mock-script/${scriptFile}`;
        console.log(`[CookieConsent] Injecting script: ${src}`);
        this.loadScript(src)
          .then(() => console.log(`[CookieConsent] Script loaded: ${src}`))
          .catch((err) =>
            console.error(`[CookieConsent] Script failed: ${src}`, err),
          );
        this.loadedScripts.add(category);
      }
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      this.document.head.appendChild(script);
    });
  }

  private getOrCreateAnonymousId(): string {
    return this._consentState()?.anonymousId ?? crypto.randomUUID();
  }
}
