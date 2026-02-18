import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClueService } from '../../services/clue.service';
import { BetService } from '../../services/bet.service';
import { Symptom } from '../../models/types';

@Component({
  selector: 'app-clues',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clues.component.html',
  styleUrl: './clues.component.css',
})
export class CluesComponent implements OnInit {
  private clueService = inject(ClueService);
  private betService = inject(BetService);

  clues = this.clueService.clues;
  symptoms = this.clueService.symptoms;
  isRevealed = this.betService.isRevealed;
  loading = signal(true);
  selectedClue = signal<string | null>(null);

  // 統計各邊勾選數量
  boyCheckedCount = computed(() => this.symptoms().filter(s => s.checkedGender === 'BOY').length);
  girlCheckedCount = computed(() => this.symptoms().filter(s => s.checkedGender === 'GIRL').length);

  // 爸媽預測（從 betService 的 revealStatus 取得）
  dadPrediction = computed(() => {
    const status = this.betService.revealStatus();
    return (status?.config as any)?.dadPrediction || null;
  });
  momPrediction = computed(() => {
    const status = this.betService.revealStatus();
    return (status?.config as any)?.momPrediction || null;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    // 載入線索
    this.clueService.getClues().subscribe({
      next: () => {
        // 載入孕徵
        this.clueService.getSymptoms().subscribe({
          next: () => {
            // 載入揭曉狀態（取得爸媽預測）
            this.betService.getRevealStatus().subscribe({
              next: () => this.loading.set(false),
              error: () => this.loading.set(false),
            });
          },
          error: () => this.loading.set(false),
        });
      },
      error: (error) => {
        console.error('Failed to load clues:', error);
        this.loading.set(false);
      },
    });
  }

  getClueTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      ULTRASOUND: '🩻 超音波',
      SYMPTOM: '🤰 孕徵',
      OTHER: '💡 其他',
    };
    return labels[type] || type;
  }

  openImage(clueId: string): void {
    this.selectedClue.set(clueId);
  }

  closeImage(): void {
    this.selectedClue.set(null);
  }
}
