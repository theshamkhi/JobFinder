import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationState } from '../../models/job.model';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (pagination && pagination.totalPages > 1) {
      <div class="flex items-center justify-between gap-4 pt-6">
        <!-- Info -->
        <p class="text-sm text-slate-500 hidden sm:block">
          Showing
          <span class="text-slate-300 font-medium">{{ startItem }}</span>–<span class="text-slate-300 font-medium">{{ endItem }}</span>
          of <span class="text-slate-300 font-medium">{{ pagination.totalItems }}</span> jobs
        </p>

        <!-- Controls -->
        <div class="flex items-center gap-1 mx-auto sm:mx-0">
          <!-- Prev -->
          <button
            (click)="onPageChange(pagination.currentPage - 1)"
            [disabled]="pagination.currentPage === 1"
            class="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span class="hidden sm:inline">Prev</span>
          </button>

          <!-- Pages -->
          @for (page of visiblePages; track page) {
            @if (page === -1) {
              <span class="px-2 text-slate-600">…</span>
            } @else {
              <button
                (click)="onPageChange(page)"
                [class.bg-primary-600]="page === pagination.currentPage"
                [class.text-white]="page === pagination.currentPage"
                [class.text-slate-400]="page !== pagination.currentPage"
                class="w-9 h-9 rounded-lg text-sm font-medium hover:bg-white/8 hover:text-white transition-all duration-200">
                {{ page }}
              </button>
            }
          }

          <!-- Next -->
          <button
            (click)="onPageChange(pagination.currentPage + 1)"
            [disabled]="pagination.currentPage === pagination.totalPages"
            class="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5">
            <span class="hidden sm:inline">Next</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  @Input() pagination!: PaginationState;
  @Output() pageChange = new EventEmitter<number>();

  get startItem(): number {
    return (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(
      this.pagination.currentPage * this.pagination.itemsPerPage,
      this.pagination.totalItems
    );
  }

  get visiblePages(): number[] {
    const { currentPage, totalPages } = this.pagination;
    const pages: number[] = [];
    const delta = 2;

    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push(-1); // ellipsis
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push(-1); // ellipsis
      pages.push(totalPages);
    }

    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
