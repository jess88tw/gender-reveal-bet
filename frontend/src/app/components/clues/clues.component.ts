import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClueService } from '../../services/clue.service';

@Component({
  selector: 'app-clues',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clues.component.html',
  styleUrl: './clues.component.css',
})
export class CluesComponent implements OnInit {
  private clueService = inject(ClueService);

  clues = this.clueService.clues;
  loading = signal(true);
  selectedClue = signal<string | null>(null);

  ngOnInit(): void {
    this.loadClues();
  }

  loadClues(): void {
    this.loading.set(true);
    this.clueService.getClues().subscribe({
      next: () => this.loading.set(false),
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
