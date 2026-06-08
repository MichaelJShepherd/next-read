import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'import',
    loadComponent: () => import('./features/import/import.component').then(m => m.ImportComponent),
  },
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/quiz.component').then(m => m.QuizComponent),
  },
  {
    path: 'result',
    loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent),
  },
  { path: '**', redirectTo: '' },
];
