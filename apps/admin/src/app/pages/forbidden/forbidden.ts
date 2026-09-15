import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTE_PATHS } from '../../app.routes.const';
import { FORBIDDEN_MESSAGES } from './forbidden.message';
import { ButtonComponent } from '@exim/ui-kit';

@Component({
  selector: 'app-forbidden',
  imports: [ButtonComponent],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.scss',
})
export class Forbidden {
  protected readonly messages = FORBIDDEN_MESSAGES;
  private readonly router = inject(Router);

  goBack(): void {
    void this.router.navigateByUrl(APP_ROUTE_PATHS.HOME);
  }
}
