import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'bet',
    loadComponent: () =>
      import('./components/betting/betting.component').then(
        (m) => m.BettingComponent,
      ),
  },
  {
    path: 'my-bets',
    loadComponent: () =>
      import('./components/my-bets/my-bets.component').then(
        (m) => m.MyBetsComponent,
      ),
  },
  {
    path: 'clues',
    loadComponent: () =>
      import('./components/clues/clues.component').then(
        (m) => m.CluesComponent,
      ),
  },
  {
    path: 'participants',
    loadComponent: () =>
      import('./components/participants/participants.component').then(
        (m) => m.ParticipantsComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin.component').then(
        (m) => m.AdminComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
