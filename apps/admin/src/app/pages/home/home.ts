import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@exim/auth-sdk';
import { IconComponent } from '@exim/ui-kit';
import { HOME_MESSAGES } from './home.message';
import { HOME_SELECTORS } from './home.selector';
import { HOME_MENU_ITEMS, HomeMenuItem } from './home.state';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly messages = HOME_MESSAGES;
  readonly selectors = HOME_SELECTORS;
  readonly menuItems = HOME_MENU_ITEMS;

  readonly userName = computed(
    () => this.authService.user()?.user?.displayName || 'User',
  );

  navigateTo(item: HomeMenuItem): void {
    if (item.disabled || !item.route) return;
    void this.router.navigate([item.route]);
  }
}
