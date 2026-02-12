export interface SourceFilters {
  themuse: boolean;
  arbeitnow: boolean;
}

// Job Search Parameters - all fields are optional
export interface JobSearchParams {
  keyword?: string;
  location?: string;
  remote?: boolean;
  level?: string;
  category?: string;
  page?: number;
  sources?: SourceFilters;
}

// Normalized Job interface (make sure it has these fields)
export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  publicationDate: string;
  tags?: string[];
  level?: string;
  category?: string;
  remote?: boolean;  // Make sure this is optional
  apiSource: 'themuse' | 'arbeitnow';
}

// Pagination State
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// The Muse API Response Types
export interface TheMuseResponse {
  page: number;
  page_count: number;
  results: TheMuseJob[];
}

export interface TheMuseJob {
  id: number;
  name: string;
  contents?: string;
  publication_date: string;
  company?: {
    name: string;
  };
  locations?: Array<{
    name: string;
  }>;
  categories?: Array<{
    name: string;
  }>;
  levels?: Array<{
    name: string;
  }>;
  refs?: {
    landing_page: string;
  };
}

// Arbeitnow API Response Types
export interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

export interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  location: string;
  description?: string;
  url: string;
  created_at: number;
  tags?: string[];
  remote: boolean;
}
