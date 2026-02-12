import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  NormalizedJob,
  JobSearchParams,
  TheMuseResponse,
  TheMuseJob,
  ArbeitnowResponse,
  ArbeitnowJob,
  PaginationState,
} from '../../shared/models/job.model';

export interface JobsResult {
  jobs: NormalizedJob[];
  pagination: PaginationState;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);

  private readonly MUSE_URL = environment.apis.themuse.baseUrl;
  private readonly ARBEITNOW_URL = environment.apis.arbeitnow.baseUrl;
  private readonly ITEMS_PER_PAGE = 10;

  // ─── The Muse ────────────────────────────────────────────────────────────────

  private searchTheMuse(params: JobSearchParams): Observable<NormalizedJob[]> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 0).toString())
      .set('descending', 'true');

    if (params.keyword) {
      // The Muse uses category-like search; we filter by keyword client-side on title
    }
    if (params.location) {
      httpParams = httpParams.set('location', params.location);
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (environment.apis.themuse.apiKey) {
      httpParams = httpParams.set('api_key', environment.apis.themuse.apiKey);
    }

    return this.http.get<TheMuseResponse>(`${this.MUSE_URL}/jobs`, { params: httpParams }).pipe(
      map(response => {
        let jobs = response.results.map(job => this.normalizeTheMuseJob(job));

        // Filter by keyword in title (business requirement)
        if (params.keyword) {
          const keywords = params.keyword.toLowerCase().split(' ').filter(k => k.length > 0);
          jobs = jobs.filter(job =>
            keywords.every(kw => job.title.toLowerCase().includes(kw))
          );
        }

        return jobs;
      }),
      catchError(err => {
        console.error('The Muse API error:', err);
        return of([]);
      })
    );
  }

  private normalizeTheMuseJob(job: TheMuseJob): NormalizedJob {
    // Strip HTML from description
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = job.contents || '';
    const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

    // Check if job is remote based on locations
    const isRemote = job.locations?.some(loc =>
      loc.name.toLowerCase().includes('remote') ||
      loc.name.toLowerCase().includes('flexible')
    ) || false;

    return {
      id: `themuse_${job.id}`,
      title: job.name,
      company: job.company?.name || 'Unknown Company',
      location: job.locations?.map(l => l.name).join(', ') || 'Remote',
      description: plainDescription.substring(0, 300) + (plainDescription.length > 300 ? '...' : ''),
      url: job.refs?.landing_page || '',
      publicationDate: job.publication_date,
      tags: job.categories?.map(c => c.name) || [],
      level: job.levels?.[0]?.name,
      category: job.categories?.[0]?.name,
      remote: isRemote,
      apiSource: 'themuse',
    };
  }

  // ─── Arbeitnow ───────────────────────────────────────────────────────────────

  private searchArbeitnow(params: JobSearchParams): Observable<NormalizedJob[]> {
    let httpParams = new HttpParams();

    if (params.remote !== undefined) {
      httpParams = httpParams.set('remote', params.remote.toString());
    }

    return this.http.get<ArbeitnowResponse>(`${this.ARBEITNOW_URL}/job-board-api`, { params: httpParams }).pipe(
      map(response => {
        let jobs = response.data.map(job => this.normalizeArbeitnowJob(job));

        // Filter by keyword in title (business requirement)
        if (params.keyword) {
          const keywords = params.keyword.toLowerCase().split(' ').filter(k => k.length > 0);
          jobs = jobs.filter(job =>
            keywords.every(kw => job.title.toLowerCase().includes(kw))
          );
        }

        // Filter by location
        if (params.location) {
          const loc = params.location.toLowerCase();
          jobs = jobs.filter(job =>
            job.location.toLowerCase().includes(loc)
          );
        }

        return jobs;
      }),
      catchError(err => {
        console.error('Arbeitnow API error:', err);
        return of([]);
      })
    );
  }

  private normalizeArbeitnowJob(job: ArbeitnowJob): NormalizedJob {
    // Strip HTML from description
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = job.description || '';
    const plainDescription = tempDiv.textContent || tempDiv.innerText || '';

    return {
      id: `arbeitnow_${job.slug}`,
      title: job.title,
      company: job.company_name,
      location: job.remote ? `${job.location} (Remote)` : job.location,
      description: plainDescription.substring(0, 300) + (plainDescription.length > 300 ? '...' : ''),
      url: job.url,
      publicationDate: new Date(job.created_at * 1000).toISOString(),
      tags: job.tags || [],
      remote: job.remote,
      apiSource: 'arbeitnow',
    };
  }

  // ─── Combined Search ──────────────────────────────────────────────────────────

  searchJobs(params: JobSearchParams): Observable<JobsResult> {
    const page = params.page ?? 1;
    const sources = params.sources ?? { themuse: true, arbeitnow: true };

    console.log('🔍 JobService.searchJobs called with:', params);
    console.log('📡 Enabled sources:', sources);

    // Build array of API calls based on enabled sources
    const apiCalls: Observable<NormalizedJob[]>[] = [];

    if (sources.themuse) {
      console.log('✅ Fetching from The Muse');
      apiCalls.push(this.searchTheMuse({ ...params, page: page - 1 })); // The Muse is 0-indexed
    } else {
      console.log('⏭️  Skipping The Muse');
      apiCalls.push(of([])); // Empty observable
    }

    if (sources.arbeitnow) {
      console.log('✅ Fetching from Arbeitnow');
      apiCalls.push(this.searchArbeitnow(params));
    } else {
      console.log('⏭️  Skipping Arbeitnow');
      apiCalls.push(of([])); // Empty observable
    }

    return combineLatest(apiCalls).pipe(
      map(([museJobs, arbeitnowJobs]) => {
        console.log('📊 Raw results - Muse:', museJobs.length, 'Arbeitnow:', arbeitnowJobs.length);

        // Merge results
        let allJobs = [...museJobs, ...arbeitnowJobs];

        // Apply remote filter to combined results
        if (params.remote === true) {
          const beforeFilter = allJobs.length;
          allJobs = allJobs.filter(job => job.remote === true);
          console.log(`🏠 Remote filter applied: ${beforeFilter} jobs → ${allJobs.length} remote jobs`);
        }

        // Sort by date (most recent first)
        allJobs.sort((a, b) =>
          new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
        );

        // Client-side pagination
        const totalItems = allJobs.length;
        const totalPages = Math.ceil(totalItems / this.ITEMS_PER_PAGE);
        const startIndex = (page - 1) * this.ITEMS_PER_PAGE;
        const paginatedJobs = allJobs.slice(startIndex, startIndex + this.ITEMS_PER_PAGE);

        console.log('📈 Final results:', {
          total: totalItems,
          page: page,
          showing: paginatedJobs.length,
          remote: params.remote,
          sources: sources
        });

        return {
          jobs: paginatedJobs,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: this.ITEMS_PER_PAGE,
          },
        };
      })
    );
  }

  // Fetch single Muse job by ID (for detail view)
  getMuseJob(id: string): Observable<NormalizedJob | null> {
    return this.http.get<TheMuseJob>(`${this.MUSE_URL}/jobs/${id}`).pipe(
      map(job => this.normalizeTheMuseJob(job)),
      catchError(() => of(null))
    );
  }
}
