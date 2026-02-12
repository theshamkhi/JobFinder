import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {LoadingSpinnerComponent} from '../../shared/components/loading-spinner/loading-spinner';
import {PaginationComponent} from '../../shared/components/pagination/pagination';
import {JobService} from '../../core/services/job.service';
import {NormalizedJob, PaginationState} from '../../shared/models/job.model';
import {JobFiltersComponent, SourceFilters} from '../job-filters/job-filters';
import {JobCardComponent} from '../../shared/components/job-card/job-card';


@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JobCardComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    JobFiltersComponent,
  ],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.css']
})
export class JobsComponent implements OnInit {
  private jobService = inject(JobService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly keyword = signal('');
  readonly location = signal('');
  readonly remoteOnly = signal(false);
  readonly sourceFilters = signal<SourceFilters>({ themuse: true, arbeitnow: true });
  readonly loading = signal(false);
  readonly hasSearched = signal(false);
  readonly jobs = signal<NormalizedJob[]>([]);
  readonly pagination = signal<PaginationState | null>(null);
  private currentPage = signal(1);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['keyword']) this.keyword.set(params['keyword']);
      if (params['location']) this.location.set(params['location']);
      if (params['remote']) this.remoteOnly.set(params['remote'] === 'true');

      if (params['sources']) {
        const sources = params['sources'].split(',');
        this.sourceFilters.set({
          themuse: sources.includes('themuse'),
          arbeitnow: sources.includes('arbeitnow')
        });
      }

      if (this.keyword() || params['browse']) this.doSearch();
    });
  }

  onKeywordChange(event: Event): void {
    this.keyword.set((event.target as HTMLInputElement).value);
  }

  onLocationChange(event: Event): void {
    this.location.set((event.target as HTMLInputElement).value);
  }

  onRemoteChange(value: boolean): void {
    console.log('Remote filter changed to:', value);
    this.remoteOnly.set(value);
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.doSearch(1);
    }
  }

  onSourceFiltersChange(filters: SourceFilters): void {
    console.log('Source filters changed to:', filters);
    this.sourceFilters.set(filters);
    this.currentPage.set(1);
    if (this.hasSearched()) {
      this.doSearch(1);
    }
  }

  doSearch(page = 1): void {
    this.loading.set(true);
    this.hasSearched.set(true);
    this.currentPage.set(page);

    const searchParams: any = {
      page,
      sources: this.sourceFilters()
    };

    if (this.keyword()) {
      searchParams.keyword = this.keyword();
    }

    if (this.location()) {
      searchParams.location = this.location();
    }

    if (this.remoteOnly()) {
      searchParams.remote = true;
    }

    console.log('🔍 Searching with params:', searchParams);

    this.jobService.searchJobs(searchParams).subscribe({
      next: (result) => {
        console.log('✅ Search results received:', result);
        console.log('📈 Total jobs:', result.jobs.length);
        console.log('🏠 Remote jobs:', result.jobs.filter((j: NormalizedJob) => j.remote).length);

        this.jobs.set(result.jobs);
        this.pagination.set(result.pagination);
        this.loading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error) => {
        console.error('❌ Search error:', error);
        this.loading.set(false);
        this.jobs.set([]);
      },
    });
  }

  browseAll(): void {
    this.doSearch();
  }

  clearSearch(): void {
    this.keyword.set('');
    this.location.set('');
    this.remoteOnly.set(false);
    this.sourceFilters.set({ themuse: true, arbeitnow: true });
    this.hasSearched.set(false);
    this.jobs.set([]);
    this.pagination.set(null);
  }

  onPageChange(page: number): void {
    this.doSearch(page);
  }

  trackByJobId(index: number, job: NormalizedJob): string {
    return job.id;
  }
}
