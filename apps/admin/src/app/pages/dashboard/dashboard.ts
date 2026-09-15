import { Component } from '@angular/core';
import { DASHBOARD_MESSAGES } from './dashboard.message';
import { DASHBOARD_SELECTORS } from './dashboard.selector';
import { dashboardState } from './dashboard.state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent {
  readonly messages = DASHBOARD_MESSAGES;
  readonly selectors = DASHBOARD_SELECTORS;
  readonly state = dashboardState;
}
