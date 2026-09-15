import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AUTH_LAYOUT_MESSAGES } from './auth-layout.message';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-layout.html',
  styleUrls: ['./auth-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {
  protected readonly messages = AUTH_LAYOUT_MESSAGES;
}
