import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SourceFilters {
  themuse: boolean;
  arbeitnow: boolean;
}

@Component({
  selector: 'app-job-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-filters.html',
  styleUrls: ['./job-filters.css']
})
export class JobFiltersComponent {
  @Input() remoteFilter = false;
  @Input() sourceFilters: SourceFilters = { themuse: true, arbeitnow: true };

  @Output() remoteChange = new EventEmitter<boolean>();
  @Output() sourceFiltersChange = new EventEmitter<SourceFilters>();

  onRemoteFilterChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;
    console.log('Filter checkbox changed:', newValue);
    this.remoteChange.emit(newValue);
  }

  onSourceFilterChange(source: 'themuse' | 'arbeitnow', event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const newFilters = {
      ...this.sourceFilters,
      [source]: checkbox.checked
    };

    if (!newFilters.themuse && !newFilters.arbeitnow) {
      // If user tries to disable both, prevent it
      checkbox.checked = true;
      console.log('⚠️ At least one source must be selected');
      return;
    }

    console.log('Source filters changed:', newFilters);
    this.sourceFiltersChange.emit(newFilters);
  }
}
