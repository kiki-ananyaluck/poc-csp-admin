import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignment-policy-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-policy-badge.html',
  styleUrl: './assignment-policy-badge.scss',
})
export class AssignmentPolicyBadgeComponent {
  @Input() policy: 'ALL' | 'ANY' = 'ANY';
}
