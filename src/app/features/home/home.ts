import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bg: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  private authService = inject(AuthService);
  readonly isAuthenticated = this.authService.isAuthenticated;

  features: Feature[] = [
    {
      icon: '🔍',
      title: 'Multi-Source Search',
      description: 'Search across The Muse and Arbeitnow simultaneously with results merged and sorted by date.',
      bg: 'rgba(99,102,241,0.1)',
    },
    {
      icon: '❤️',
      title: 'Save Favorites',
      description: 'Bookmark interesting positions with one click. Your favorites persist across sessions.',
      bg: 'rgba(244,63,94,0.1)',
    },
    {
      icon: '📋',
      title: 'Track Applications',
      description: 'Keep track of every application with statuses: Pending, Accepted, or Rejected.',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      icon: '🌍',
      title: 'Global Coverage',
      description: 'Find jobs from companies worldwide, including remote positions across Europe and beyond.',
      bg: 'rgba(6,182,212,0.1)',
    },
    {
      icon: '📝',
      title: 'Personal Notes',
      description: 'Add private notes to each application to remember key details and follow-up tasks.',
      bg: 'rgba(249,115,22,0.1)',
    },
    {
      icon: '⚡',
      title: 'Real-Time Results',
      description: 'Get fresh job listings with live data from multiple APIs, sorted newest first.',
      bg: 'rgba(234,179,8,0.1)',
    },
  ];
}
