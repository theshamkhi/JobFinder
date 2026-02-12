import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16" [class]="containerClass">
      <div class="relative">
        <div class="w-12 h-12 rounded-full border-2 border-white/10"></div>
        <div class="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
        <div class="absolute inset-2 w-8 h-8 rounded-full border-2 border-transparent border-t-accent-500/60 animate-spin" style="animation-duration: 0.75s; animation-direction: reverse;"></div>
      </div>
      @if (message) {
        <p class="text-slate-500 text-sm animate-pulse-soft">{{ message }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
  @Input() containerClass = '';
}
