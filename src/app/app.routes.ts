import { Routes } from '@angular/router';
import { LandingRoute, PortalPage } from './portal-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingRoute },
  { path: 'projects', component: PortalPage, data: { kind: 'projects' } },
  { path: 'projects/:id', component: PortalPage, data: { kind: 'detail' } },
  { path: 'workshops', redirectTo: 'projects' },
  { path: 'login', component: PortalPage, data: { kind: 'login' } },
  { path: 'register', component: PortalPage, data: { kind: 'register' } },
  { path: '**', redirectTo: '' },
];
