import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BetService } from '../../services/bet.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  private betService = inject(BetService);
  private destroyRef = inject(DestroyRef);

  // 直接使用 service 的 signals
  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isLoggedIn;
  isAdmin = this.authService.isAdmin;
  stats = this.betService.stats;
  boyPercentage = this.betService.boyPercentage;
  girlPercentage = this.betService.girlPercentage;
  totalPrizePool = this.betService.totalPrizePool;

  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();

    // 每 30 秒自動更新統計
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadStats());
  }

  loadStats(): void {
    this.loading.set(true);
    this.betService.getStats().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        console.error('Failed to load stats:', error);
        this.loading.set(false);
      },
    });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  loginWithLine(): void {
    this.authService.loginWithLine();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => console.log('Logged out successfully'),
      error: (error) => console.error('Logout failed:', error),
    });
  }
}
