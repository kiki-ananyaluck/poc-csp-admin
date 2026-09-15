import { UserProfilePanelMenuItem } from '@exim/ui-kit';
import { USER_PROFILE_PANEL_MESSAGES } from './user-profile-panel.message';

export const USER_PROFILE_PANEL_MENU: UserProfilePanelMenuItem[] = [
  {
    label: USER_PROFILE_PANEL_MESSAGES.MENU_LOGOUT,
    icon: 'logout',
    action: 'logout',
  },
];
