import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  IconComponent,
  SearchInputComponent,
} from '@exim/ui-kit';
import { FilterValue } from '../../codex.types';
import { DATA_MANAGEMENT_TABLE_MESSAGES } from '../../codex.message';

@Component({
  selector: 'app-dmt-search-filter',
  standalone: true,
  imports: [
    SearchInputComponent,
    ButtonComponent,
    CheckboxComponent,
    IconComponent,
  ],
  templateUrl: './dmt-search-filter.html',
  styleUrl: './dmt-search-filter.scss',
})
export class DmtSearchFilterComponent {
  protected readonly messages = DATA_MANAGEMENT_TABLE_MESSAGES;
  private readonly el = inject(ElementRef);

  @Input() filteredTotal = 0;
  @Input() appliedStatusActive = false;
  @Input() appliedStatusInactive = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterApply = new EventEmitter<FilterValue>();
  @Output() removeActiveChip = new EventEmitter<'active' | 'inactive'>();

  protected searchValue = signal('');
  protected isFilterPanelOpen = signal(false);
  protected pendingStatusActive = signal(false);
  protected pendingStatusInactive = signal(false);

  protected get hasActiveFilter(): boolean {
    return this.appliedStatusActive || this.appliedStatusInactive;
  }

  protected onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.searchChange.emit(value);
  }

  protected toggleFilterPanel(): void {
    if (!this.isFilterPanelOpen()) {
      this.pendingStatusActive.set(this.appliedStatusActive);
      this.pendingStatusInactive.set(this.appliedStatusInactive);
    }
    this.isFilterPanelOpen.update((v) => !v);
  }

  protected onFilterClear(): void {
    this.pendingStatusActive.set(false);
    this.pendingStatusInactive.set(false);
  }

  protected onFilterCancel(): void {
    this.isFilterPanelOpen.set(false);
  }

  protected onFilterApply(): void {
    this.filterApply.emit({
      statusActive: this.pendingStatusActive(),
      statusInactive: this.pendingStatusInactive(),
    });
    this.isFilterPanelOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target)) {
      this.isFilterPanelOpen.set(false);
    }
  }
}
