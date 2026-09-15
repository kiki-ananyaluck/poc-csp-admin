import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TRUST_DEVICE_MESSAGES } from './trust-device-modal.message';
import { TrustDeviceService } from './trust-device.service';

@Component({
  selector: 'app-trust-device-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trust-device-modal.html',
  styleUrl: './trust-device-modal.scss',
})
export class TrustDeviceModalComponent {
  protected readonly trustDeviceService = inject(TrustDeviceService);

  protected readonly modalTitle = TRUST_DEVICE_MESSAGES.TITLE;
  protected readonly modalSubtitle = TRUST_DEVICE_MESSAGES.SUBTITLE;
  protected readonly modalSkipButton = TRUST_DEVICE_MESSAGES.SKIP_BUTTON;
  protected readonly modalTrustDeviceButton =
    TRUST_DEVICE_MESSAGES.TRUST_DEVICE_BUTTON;

  onSkip(): void {
    this.trustDeviceService.close();
  }

  onTrustDevice(): void {
    // TODO: implement trust device logic
    this.trustDeviceService.close();
  }
}
