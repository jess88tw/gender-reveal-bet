import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Bet, RevealConfig } from '../../models/types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;

  allBets = this.adminService.allBets;
  revealConfig = this.adminService.revealConfig;
  adminWinner = this.adminService.winner;
  adminPrizeInfo = this.adminService.prizeInfo;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // 統計
  totalBets = computed(() => this.allBets().length);
  paidBets = computed(() => this.allBets().filter(b => b.isPaid));
  unpaidBets = computed(() => this.allBets().filter(b => !b.isPaid));
  boyBets = computed(() => this.allBets().filter(b => b.gender === 'BOY'));
  girlBets = computed(() => this.allBets().filter(b => b.gender === 'GIRL'));
  totalPool = computed(() => this.paidBets().reduce((sum, b) => sum + b.amount, 0));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    // 載入所有資料
    this.adminService.getAllBets().subscribe({
      next: () => {
        this.adminService.getRevealConfig().subscribe({
          next: () => this.loading.set(false),
          error: () => this.loading.set(false),
        });
      },
      error: (err) => {
        this.error.set(err.error?.error || '載入失敗，請確認您有管理員權限');
        this.loading.set(false);
      },
    });
  }

  confirmPayment(bet: Bet): void {
    if (bet.isPaid) return;

    this.actionLoading.set(true);
    this.adminService.confirmPayment(bet.id).subscribe({
      next: () => {
        this.successMessage.set(`已確認 ${bet.user?.name} 的付款`);
        this.actionLoading.set(false);
        this.loadData(); // 重新載入
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.error || '確認付款失敗');
        this.actionLoading.set(false);
      },
    });
  }

  revealGender(gender: 'BOY' | 'GIRL'): void {
    if (!confirm(`確定要揭曉性別為「${gender === 'BOY' ? '男生' : '女生'}」嗎？此操作無法復原！`)) {
      return;
    }

    this.actionLoading.set(true);
    this.adminService.revealGender(gender).subscribe({
      next: (res) => {
        this.successMessage.set('性別揭曉成功！');
        this.actionLoading.set(false);
        this.loadData();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.error || '揭曉失敗');
        this.actionLoading.set(false);
      },
    });
  }

  drawWinner(): void {
    if (!confirm('確定要抽獎嗎？此操作無法復原！')) {
      return;
    }

    this.actionLoading.set(true);
    this.adminService.drawWinner().subscribe({
      next: (res: any) => {
        this.successMessage.set(`🎉 恭喜 ${res.winner.name} 中獎！`);
        this.actionLoading.set(false);
        this.loadData();
      },
      error: (err) => {
        this.error.set(err.error?.error || '抽獎失敗');
        this.actionLoading.set(false);
      },
    });
  }

  clearMessages(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }

  clearAllData(): void {
    if (!confirm('⚠️ 確定要清空所有資料嗎？（使用者、下注、揭曉設定全部刪除）\n\n此操作無法復原！')) {
      return;
    }

    this.actionLoading.set(true);
    this.adminService.clearData().subscribe({
      next: (res) => {
        // 清空資料後，後端 session 已銷毀，前端也需清除登入狀態
        this.authService.clearUser();
        alert(
          `已清空：${res.deleted.users} 位使用者、${res.deleted.bets} 筆下注、${res.deleted.revealConfig} 筆揭曉設定\n\n將返回首頁，請重新登入。`
        );
        this.actionLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.error || '清空資料失敗');
        this.actionLoading.set(false);
      },
    });
  }
}
