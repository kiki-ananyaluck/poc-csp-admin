import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';

  get normalizedStatus(): string {
    return this.status.toLowerCase().replace(/ /g, '_');
  }
}
