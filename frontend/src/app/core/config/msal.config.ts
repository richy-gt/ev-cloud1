// Configuracion de MSAL (Microsoft Authentication Library) para Angular
// Cumple con la pauta de evaluacion de Duoc UC para integracion con Azure AD (Entra ID)

import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
  Configuration,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  ProtectedResourceScopes,
} from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

export function isAzureConfigured(): boolean {
  const cid = environment.azure.clientId;
  return (
    typeof cid === 'string' &&
    cid.trim() !== '' &&
    cid !== 'TU_CLIENT_ID_DE_AZURE' &&
    cid !== '00000000-0000-0000-0000-000000000000' &&
    cid.length > 8
  );
}

export function loggerCallback(logLevel: LogLevel, message: string): void {
  if (logLevel === LogLevel.Error || logLevel === LogLevel.Warning) {
    console.warn('[MSAL]', message);
  }
}

export function MSALInstanceFactory(): IPublicClientApplication {
  const clientId = isAzureConfigured()
    ? environment.azure.clientId
    : '00000000-0000-0000-0000-000000000000';

  const authority = isAzureConfigured()
    ? environment.azure.authority
    : 'https://login.microsoftonline.com/common';

  const msalConfig: Configuration = {
    auth: {
      clientId,
      authority,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  };

  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.azure.scopes,
    },
    loginFailedRoute: '/login',
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes> | null>();

  // Endpoints protegidos del API Gateway de AWS y microservicios
  protectedResourceMap.set(environment.api.baseUrl, environment.azure.scopes);
  protectedResourceMap.set(environment.api.localBaseUrl, environment.azure.scopes);
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['User.Read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}
