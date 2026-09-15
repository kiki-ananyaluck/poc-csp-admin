import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrustDeviceService {
  readonly isOpen = signal(false);

  toggleTrustDevice(): void {
    this.isOpen.set(!this.isOpen());
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
