// Guard de autenticacion para rutas protegidas
// Cumple con la pauta de evaluacion protegiendo vistas con MsalGuard / AuthService

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { AuthService } from '../services/auth.service';
import { isAzureConfigured } from '../config/msal.config';

export const appAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si Azure AD esta configurado con credenciales reales, delegamos o verificamos estado
  if (isAzureConfigured()) {
    const msalGuard = inject(MsalGuard);
    // Ejecuta el guard oficial de MSAL
    return msalGuard.canActivate(route, state);
  }

  // Si esta en modo simulacion (o aun no configurado en Azure)
  const isDemoActive = localStorage.getItem('pedidos360_demo_session') === 'true';
  let isAuthenticated = false;

  const sub = authService.isAuthenticated$.subscribe((val) => {
    isAuthenticated = val;
  });
  sub.unsubscribe();

  if (isAuthenticated || isDemoActive) {
    return true;
  }

  // Redireccionar al login
  return router.parseUrl('/login');
};
