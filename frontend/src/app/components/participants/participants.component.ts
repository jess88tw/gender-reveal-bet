import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BetService } from '../../services/bet.service';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.css',
})
export class ParticipantsComponent implements OnInit {
  private betService = inject(BetService);

  participants = this.betService.participants;
  loading = signal(true);
  sortBy = signal<'name' | 'total' | 'boy' | 'girl'>('total');

  sortedParticipants = computed(() => {
    const list = [...this.participants()];
    const sort = this.sortBy();

    return list.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'boy':
          return b.boyTickets - a.boyTickets;
        case 'girl':
          return b.girlTickets - a.girlTickets;
        case 'total':
        default:
          return b.boyTickets + b.girlTickets - (a.boyTickets + a.girlTickets);
      }
    });
  });

  ngOnInit(): void {
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.loading.set(true);
    this.betService.getParticipants().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        console.error('Failed to load participants:', error);
        this.loading.set(false);
      },
    });
  }

  setSortBy(sort: 'name' | 'total' | 'boy' | 'girl'): void {
    this.sortBy.set(sort);
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getTotalTickets(p: { boyTickets: number; girlTickets: number }): number {
    return p.boyTickets + p.girlTickets;
  }
}
