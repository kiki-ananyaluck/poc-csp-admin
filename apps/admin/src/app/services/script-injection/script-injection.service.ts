import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ConsentService } from '../consent-service/consent/consent.service';
import { ConsentCategory } from '../consent-service/consent/consent.model';

export interface ScriptDefinition {
  src: string;
  category: ConsentCategory;
  attributes?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ScriptInjectionService {
  private readonly document = inject(DOCUMENT);
  private readonly consentService = inject(ConsentService);

  /**
   * Tracks in-flight and completed script loads.
   * Key: src URL  |  Value: Promise that resolves on load, rejects on error.
   * AC: ไม่โหลดซ้ำ — returning the same Promise for duplicate calls.
   */
  private readonly loadedScripts = new Map<string, Promise<void>>();

  private registeredScripts: ScriptDefinition[] = [];

  // ─── Public API ────────────────────────────────────────────────────────────

  registerScripts(scripts: ScriptDefinition[]): void {
    this.registeredScripts = scripts;
  }

  /**
   * SA-1145 AC: loadScript(src)
   * inject <script> เข้า <head> โดยใช้ document.createElement('script')
   * - ถ้าโหลดไปแล้ว → return Promise เดิม (ไม่โหลดซ้ำ)
   * - resolve เมื่อ load สำเร็จ
   * - reject เมื่อ load ล้มเหลว (ไม่ throw, caller รับ error เอง)
   *
   * @param async - default `true`. ตั้งเป็น `false` สำหรับ scripts ที่ต้องรักษาลำดับ
   *   เช่น OtAutoBlock.js (ต้องรันก่อนเพื่อบล็อก 3rd-party) และ otSDKStub.js
   *   ซึ่งจะทำให้ OneTrust ตรวจจับ page state ถูกต้องและแสดง slide animation
   */
  loadScript(
    src: string,
    attributes?: Record<string, string>,
    async = true,
  ): Promise<void> {
    const existing = this.loadedScripts.get(src);
    if (existing) {
      return existing; // AC: handle duplicate — same Promise, no double inject
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = async;

      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          script.setAttribute(key, value);
        }
      }

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`ScriptInjectionService: failed to load "${src}"`));

      // AC: inject เข้า <head>
      this.document.head.appendChild(script);
    });

    this.loadedScripts.set(src, promise);
    return promise;
  }

  /**
   * โหลด scripts ที่ลงทะเบียนไว้ทั้งหมด ถ้า consent category อนุญาต
   * เรียกหลังจาก user กด Accept / Reject / Save preferences
   */
  injectAllowedScripts(): void {
    for (const def of this.registeredScripts) {
      if (this.consentService.isCategoryAllowed(def.category)) {
        this.loadScript(def.src, def.attributes).catch(() => {
          // ไม่ let script load failure พัง app — log เงียบๆ
        });
      }
    }
  }
}
