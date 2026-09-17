// Archivo de configuracion de entorno para Pedidos360
// La persona encargada de Azure debe ingresar sus valores en este archivo.

export const environment = {
  production: false,

  // Configuracion de Azure Active Directory (Entra ID)
  azure: {
    // 1. Application (client) ID registrado en Azure Portal
    clientId: '438f00d6-0d85-47f8-b2ce-8bb0692ab42e',

    // 2. Directory (tenant) ID registrado en Azure Portal
    tenantId: '3aff258d-8148-4333-b4f0-b703a6506f13',

    // 3. Authority URL (o tenantId directamente)
    // Ejemplo: https://login.microsoftonline.com/TU_TENANT_ID_DE_AZURE
    authority: 'https://login.microsoftonline.com/3aff258d-8148-4333-b4f0-b703a6506f13',

    // 4. URI de redireccion autorizada en Azure Portal (Single-Page Application)
    redirectUri: 'http://localhost:4200',

    // 5. URL de cierre de sesion
    postLogoutRedirectUri: 'http://localhost:4200/login',

    // 6. Scopes solicitados para acceder a la API del backend
    // Ejemplo: ['api://TU_BACKEND_CLIENT_ID/access_as_user', 'User.Read']
    scopes: ['api://8d2ecd3f-4a43-467d-b2f9-e75e887036e1/access_as_user', 'User.Read'],
  },

  // Configuracion del API Gateway / BFF (Spring Boot en AWS EC2)
  api: {
    // URL base del API Gateway de AWS o BFF
    baseUrl: 'https://api-gateway.pedidos360.com/api',
    // Si esta en desarrollo local con Spring Boot:
    localBaseUrl: 'http://localhost:8080/api',
  },

  // Modo demostracion / simulacion:
  // Si clientId es 'TU_CLIENT_ID_DE_AZURE', la aplicacion opera en modo simulacion con datos de prueba
  // para permitir navegar la plataforma completa antes de que se registren las credenciales reales en Azure.
  enableMockAuthWhenUnconfigured: true,
};
