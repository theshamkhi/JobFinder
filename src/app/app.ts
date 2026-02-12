import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { AuthService } from './core/services/auth.service';
import { Store } from '@ngrx/store';
import { FavoritesActions } from './store/favorites/favorites.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private store = inject(Store);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
    }
  }
}
