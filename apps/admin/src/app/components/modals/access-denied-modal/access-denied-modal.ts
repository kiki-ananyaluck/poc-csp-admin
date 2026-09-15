import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent, ModalButton, IconComponent } from '@exim/ui-kit';
import { AccessDeniedState } from './access-denied.state';
import { ACCESS_DENIED_MESSAGES } from './access-denied-modal.message';

@Component({
  selector: 'app-access-denied-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, IconComponent],
  templateUrl: './access-denied-modal.html',
  styleUrl: './access-denied-modal.scss',
})
export class AccessDeniedModalComponent {
  private accessDeniedState = inject(AccessDeniedState);

  protected readonly modalTitle = ACCESS_DENIED_MESSAGES.TITLE;

  protected readonly isOpen = this.accessDeniedState.isOpen;
  private readonly appName = this.accessDeniedState.appName;

  protected readonly subtitle = computed(() =>
    ACCESS_DENIED_MESSAGES.SUBTITLE(this.appName()),
  );

  protected readonly okButton: ModalButton = {
    label: ACCESS_DENIED_MESSAGES.OK_BUTTON,
    variant: 'primary',
    action: () => this.accessDeniedState.close(),
  };
}
