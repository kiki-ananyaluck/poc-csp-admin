import { Component, inject, output } from '@angular/core';
import { UserProfilePanelComponent as ExUserProfilePanelComponent } from '@exim/ui-kit';
import { AuthService } from '@exim/auth-sdk';
import { USER_PROFILE_PANEL_MESSAGES } from './user-profile-panel.message';
import { UserProfilePanelState } from './user-profile-panel.state';
import { USER_PROFILE_PANEL_MENU } from './user-profile-panel.config';
import { LogoutConfirmState } from '../../modals/logout-confirm-modal/logout-confirm-modal.state';

@Component({
  selector: 'app-user-profile-panel',
  standalone: true,
  imports: [ExUserProfilePanelComponent],
  providers: [UserProfilePanelState],
  template: `
    <ex-user-profile-panel
      [menuItems]="menuItems"
      [displayName]="state.displayName()"
      [email]="state.email()"
      [avatarUrl]="state.avatarUrl()"
      [sectionLabel]="messages.SECTION_CURRENT_USER"
      (closed)="closed.emit()"
      (menuAction)="onMenuAction($event)"
    ></ex-user-profile-panel>
  `,
})
export class UserProfilePanelComponent {
  protected readonly messages = USER_PROFILE_PANEL_MESSAGES;
  protected readonly menuItems = USER_PROFILE_PANEL_MENU;
  protected readonly state = inject(UserProfilePanelState);
  private readonly authService = inject(AuthService);
  private readonly logoutConfirmState = inject(LogoutConfirmState);

  closed = output<void>();

  onMenuAction(action: string): void {
    switch (action) {
      case 'logout':
        this.closed.emit();
        this.logoutConfirmState.open();
        break;
    }
  }
}
