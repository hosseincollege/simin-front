import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { LandingRoute, PortalPage } from './portal-page';
import { WorkshopDetailPage } from './workshop-detail-page';
import { WorkshopListPage } from './workshop-list-page';

const requireAuth: CanActivateFn = () => {
  const router = inject(Router);
  try {
    return localStorage.getItem('simin.auth.token') ? true : router.createUrlTree(['/login']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};

const requireAdmin: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const user = JSON.parse(localStorage.getItem('simin.auth.user') || 'null') as { role?: string } | null;
    return localStorage.getItem('simin.auth.token') && user?.role === 'admin'
      ? true
      : router.createUrlTree(['/manage-workshops']);
  } catch {
    return router.createUrlTree(['/manage-workshops']);
  }
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'workshops' },
  { path: 'projects/:id', redirectTo: 'workshops/:id' },
  { path: 'workshops/new', component: PortalPage, canActivate: [requireAuth], data: { kind: 'create' } },
  { path: 'workshops/:id/edit', component: PortalPage, canActivate: [requireAuth], data: { kind: 'edit' } },
  { path: 'workshops/:id', component: WorkshopDetailPage },
  { path: 'projects', pathMatch: 'full', redirectTo: 'workshops' },
  { path: 'workshops', pathMatch: 'full', component: WorkshopListPage },
  { path: 'dashboard', component: PortalPage, canActivate: [requireAuth], data: { kind: 'dashboard' } },
  { path: 'manage-workshops', component: PortalPage, canActivate: [requireAuth], data: { kind: 'manage-workshops' } },
  { path: 'review-workshops', component: PortalPage, canActivate: [requireAdmin], data: { kind: 'review-workshops' } },
  { path: 'investments', component: PortalPage, canActivate: [requireAuth], data: { kind: 'investments' } },
  { path: 'login', component: PortalPage, data: { kind: 'login' } },
  { path: 'register', component: PortalPage, data: { kind: 'register' } },
  { path: '**', redirectTo: '' },
];
