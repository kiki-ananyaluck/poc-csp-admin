import { Component, input } from '@angular/core';

@Component({
  selector: 'app-term-status-badge',
  standalone: true,
  templateUrl: './term-status-badge.html',
  styleUrl: './term-status-badge.scss',
})
export class TermStatusBadgeComponent {
  readonly status = input.required<string>();
  readonly publishedLabel = input<string>('Published');
  readonly inactiveLabel = input<string>('Inactive');
}
