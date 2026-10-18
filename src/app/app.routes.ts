import { Routes } from '@angular/router';
import { LandingRoute, PortalPage } from './portal-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingRoute },
  { path: 'projects/:id', component: PortalPage, data: { kind: 'detail' } },
  { path: 'workshops/new', component: PortalPage, data: { kind: 'create' } },
  { path: 'projects', pathMatch: 'full', component: PortalPage, data: { kind: 'projects' } },
  { path: 'workshops', pathMatch: 'full', component: PortalPage, data: { kind: 'projects' } },
  { path: 'dashboard', component: PortalPage, data: { kind: 'dashboard' } },
  { path: 'login', component: PortalPage, data: { kind: 'login' } },
  { path: 'register', component: PortalPage, data: { kind: 'register' } },
  { path: '**', redirectTo: '' },
];
