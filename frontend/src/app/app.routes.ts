import { Routes } from '@angular/router';
import { appAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [appAuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'pedidos',
    canActivate: [appAuthGuard],
    loadComponent: () => import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'pedidos/nuevo',
    canActivate: [appAuthGuard],
    loadComponent: () => import('./pages/create-order/create-order.component').then((m) => m.CreateOrderComponent),
  },
  {
    path: 'tokens',
    canActivate: [appAuthGuard],
    loadComponent: () => import('./pages/token-inspector/token-inspector.component').then((m) => m.TokenInspectorComponent),
  },
  {
    path: 'api-tester',
    canActivate: [appAuthGuard],
    loadComponent: () => import('./pages/api-tester/api-tester.component').then((m) => m.ApiTesterComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
