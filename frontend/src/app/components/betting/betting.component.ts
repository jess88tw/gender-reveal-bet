import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BetService } from '../../services/bet.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-betting',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './betting.component.html',
  styleUrl: './betting.component.css',
})
export class BettingComponent {
  private betService = inject(BetService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;

  selectedGender = signal<'BOY' | 'GIRL' | null>(null);
  paymentMethod = signal('bank_transfer');
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  alreadyBet = signal(false);

  // 固定金額
  readonly amount = 200;

  canSubmit = computed(
    () =>
      this.selectedGender() !== null &&
      !this.submitting() &&
      !this.alreadyBet(),
  );

  selectGender(gender: 'BOY' | 'GIRL'): void {
    this.selectedGender.set(gender);
    this.error.set(null);
  }

  setPaymentMethod(method: string): void {
    this.paymentMethod.set(method);
  }

  checkExistingBet(): void {
    this.betService.getMyBets().subscribe({
      next: (res) => {
        if (res.bets.length > 0) {
          this.alreadyBet.set(true);
          this.error.set('您已經下注過了，每人限一注');
        }
      },
    });
  }

  submitBet(): void {
    if (!this.canSubmit()) return;
    if (!this.isLoggedIn()) {
      this.error.set('請先登入');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.betService
      .placeBet(this.selectedGender()!, this.paymentMethod())
      .subscribe({
        next: () => {
          this.success.set(true);
          this.submitting.set(false);
          this.alreadyBet.set(true);
          // 更新統計
          this.betService.refreshAll();
        },
        error: (err) => {
          this.error.set(err.error?.error || '下注失敗，請稍後再試');
          this.submitting.set(false);
        },
      });
  }

  resetForm(): void {
    this.selectedGender.set(null);
    this.success.set(false);
    this.error.set(null);
  }

  goToMyBets(): void {
    this.router.navigate(['/my-bets']);
  }
}
