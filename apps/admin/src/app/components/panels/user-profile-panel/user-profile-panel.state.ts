import { inject, Injectable, computed } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';

@Injectable()
export class UserProfilePanelState {
  private readonly authService = inject(AuthService);

  readonly displayName = computed(
    () => this.authService.user()?.user?.displayName || 'User',
  );
  readonly email = computed(
    () => this.authService.user()?.user?.email || 'user@example.com',
  );

  readonly avatarUrl = computed(() => {
    const avatarURL = this.authService.user()?.user?.avatarURL;
    return avatarURL ? `${avatarURL}` : 'images/user-profile.png';
  });
}
