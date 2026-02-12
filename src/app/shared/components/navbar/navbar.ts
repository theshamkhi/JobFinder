import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesActions } from '../../../store/favorites/favorites.actions';
import { selectFavoritesCount } from '../../../store/favorites/favorites.selectors';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private store = inject(Store);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.currentUser;
  readonly favoritesCount = this.store.selectSignal(selectFavoritesCount);

  readonly dropdownOpen = signal(false);
  readonly mobileMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown-container');

    if (dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(value => !value);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.dropdownOpen.set(false);
  }

  logout(): void {
    this.store.dispatch(FavoritesActions.clearFavorites());
    this.authService.logout();
    this.closeDropdown();
    this.closeMobileMenu();
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`;
  }

  getUserFirstName(): string {
    const user = this.currentUser();
    return user?.firstName ?? '';
  }

  getUserFullName(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }

  getUserEmail(): string {
    const user = this.currentUser();
    return user?.email ?? '';
  }

  getFavoritesCountDisplay(): string | number {
    const count = this.favoritesCount();
    return count > 9 ? '9+' : count;
  }

  shouldShowFavoritesCount(): boolean {
    return this.favoritesCount() > 0;
  }
}
