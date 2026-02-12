import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFilters } from './job-filters';

describe('JobFilters', () => {
  let component: JobFilters;
  let fixture: ComponentFixture<JobFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
