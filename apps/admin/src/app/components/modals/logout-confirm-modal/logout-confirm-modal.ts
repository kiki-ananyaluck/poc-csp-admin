import { Component, inject } from '@angular/core';
import { ModalComponent, ModalButton, IconComponent } from '@exim/ui-kit';
import { AuthService } from '@exim/auth-sdk';
import { LogoutConfirmState } from './logout-confirm-modal.state';
import { LOGOUT_CONFIRM_MESSAGES } from './logout-confirm-modal.message';

@Component({
  selector: 'app-logout-confirm-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  templateUrl: './logout-confirm-modal.html',
  styleUrl: './logout-confirm-modal.scss',
})
export class LogoutConfirmModalComponent {
  protected readonly state = inject(LogoutConfirmState);
  private readonly authService = inject(AuthService);

  protected readonly modalTitle = LOGOUT_CONFIRM_MESSAGES.TITLE;

  protected readonly cancelButton: ModalButton = {
    label: LOGOUT_CONFIRM_MESSAGES.CANCEL_BUTTON,
    variant: 'text',
    action: () => this.state.close(),
  };

  protected readonly confirmButton: ModalButton = {
    label: LOGOUT_CONFIRM_MESSAGES.CONFIRM_BUTTON,
    variant: 'error',
    action: () => {
      this.state.close();
      this.authService.logoutEntra();
    },
  };
}
