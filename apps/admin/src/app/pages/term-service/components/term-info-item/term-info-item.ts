import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-term-info-item',
  standalone: true,
  templateUrl: './term-info-item.html',
  styleUrl: './term-info-item.scss',
})
export class TermInfoItemComponent {
  @Input() label = '';
}
