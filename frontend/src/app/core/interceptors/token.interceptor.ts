// Interceptor HTTP complementario para asegurar cabeceras de autorizacion
// Inyecta el token Bearer en las llamadas hacia el backend o API Gateway

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { isAzureConfigured } from '../config/msal.config';
import { environment } from '../../../environments/environment';

export const customTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Si Azure AD ya esta configurado, MsalInterceptor de @azure/msal-angular
  // se encarga de interceptar segun protectedResourceMap.
  if (isAzureConfigured()) {
    return next(req);
  }

  // En modo local o de simulacion, inyectamos el Bearer Token para que el estudiante
  // y docente puedan visualizar el header Authorization en las llamadas al API Gateway.
  const isApiTarget =
    req.url.startsWith(environment.api.baseUrl) ||
    req.url.startsWith(environment.api.localBaseUrl) ||
    req.url.includes('/api/');

  if (isApiTarget && !req.headers.has('Authorization')) {
    let rawToken = '';
    const sub = authService.rawToken$.subscribe((t) => (rawToken = t));
    sub.unsubscribe();

    if (!rawToken) {
      // Tomar o generar demo token
      rawToken = authService.inspectToken().rawToken;
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${rawToken}`,
        'X-Client-App': 'Pedidos360-Angular',
      },
    });

    return next(cloned);
  }

  return next(req);
};
