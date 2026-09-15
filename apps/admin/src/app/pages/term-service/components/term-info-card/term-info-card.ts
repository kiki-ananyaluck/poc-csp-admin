import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-term-info-card',
  standalone: true,
  templateUrl: './term-info-card.html',
  styleUrl: './term-info-card.scss',
})
export class TermInfoCardComponent {
  @Input() testId?: string;
}
