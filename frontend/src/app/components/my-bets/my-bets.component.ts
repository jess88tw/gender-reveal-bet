import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bets.component.html',
  styleUrl: './my-bets.component.css',
})
export class MyBetsComponent implements OnInit {
  private betService = inject(BetService);
  private authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;
  myBets = this.betService.myBets;
  loading = signal(true);

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.loadMyBets();
    } else {
      this.loading.set(false);
    }
  }

  loadMyBets(): void {
    this.loading.set(true);
    this.betService.getMyBets().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        console.error('Failed to load bets:', error);
        this.loading.set(false);
      },
    });
  }

  getTotalByGender(gender: 'BOY' | 'GIRL'): {
    amount: number;
    tickets: number;
  } {
    const bets = this.myBets().filter((b) => b.gender === gender);
    return {
      amount: bets.reduce((sum, b) => sum + b.amount, 0),
      tickets: bets.reduce((sum, b) => sum + b.ticketCount, 0),
    };
  }

  get totalAmount(): number {
    return this.myBets().reduce((sum, b) => sum + b.amount, 0);
  }

  get totalTickets(): number {
    return this.myBets().reduce((sum, b) => sum + b.ticketCount, 0);
  }
}
