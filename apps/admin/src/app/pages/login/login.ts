import { Component, inject } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';
import { ButtonComponent } from '@exim/ui-kit';
import { APP_ROUTE_PATHS } from '../../app.routes.const';
import { LOGIN_MESSAGES } from './login.message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  protected readonly messages = LOGIN_MESSAGES;
  private readonly authService = inject(AuthService);

  onLogin(): void {
    this.authService.loginSentinelRedirect(
      'employee',
      true,
      APP_ROUTE_PATHS.HOME,
    );
  }
}
