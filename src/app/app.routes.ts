import { Routes } from '@angular/router';
import { LandingRoute, PortalPage } from './portal-page';
import { WorkshopDetailPage } from './workshop-detail-page';
import { WorkshopListPage } from './workshop-list-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'workshops' },
  { path: 'projects/:id', redirectTo: 'workshops/:id' },
  { path: 'workshops/new', component: PortalPage, data: { kind: 'create' } },
  { path: 'workshops/:id/edit', component: PortalPage, data: { kind: 'edit' } },
  { path: 'workshops/:id', component: WorkshopDetailPage },
  { path: 'projects', pathMatch: 'full', redirectTo: 'workshops' },
  { path: 'workshops', pathMatch: 'full', component: WorkshopListPage },
  { path: 'dashboard', component: PortalPage, data: { kind: 'dashboard' } },
  { path: 'login', component: PortalPage, data: { kind: 'login' } },
  { path: 'register', component: PortalPage, data: { kind: 'register' } },
  { path: '**', redirectTo: '' },
];
