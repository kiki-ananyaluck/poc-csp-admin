import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WORKFLOW_TEMPLATE_MESSAGES } from '../../workflow-template/workflow-template.message';

export interface PickerAction {
  id: string;
  label: string;
}

const ACTIONS: PickerAction[] = [
  { id: 'action', label: WORKFLOW_TEMPLATE_MESSAGES.ADD_STEP },
  { id: 'parallel', label: WORKFLOW_TEMPLATE_MESSAGES.ADD_PARALLEL },
  { id: 'close', label: WORKFLOW_TEMPLATE_MESSAGES.CLOSE_NODE },
];

@Component({
  selector: 'app-action-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-picker.html',
  styleUrl: './action-picker.scss',
})
export class ActionPickerComponent {
  private readonly el = inject(ElementRef<HTMLElement>);

  @Input() anchorId: string | null = null;
  @Input() isInsideParallel = false;
  @Output() actionSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  searchTerm = '';
  readonly searchPlaceholder = 'Search actions';
  readonly emptyStateLabel = 'No matching actions found';

  get filteredActions(): PickerAction[] {
    if (!this.searchTerm.trim()) {
      return ACTIONS;
    }

    const term = this.searchTerm.toLowerCase();
    return ACTIONS.filter((action) => action.label.toLowerCase().includes(term));
  }

  selectAction(actionId: string): void {
    this.actionSelected.emit(actionId);
  }

  close(): void {
    this.closed.emit();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target as Node | null)) {
      this.close();
    }
  }
}
