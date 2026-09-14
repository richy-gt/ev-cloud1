# Guia de Microsoft Azure para Pedidos360

Esta guia resume exclusivamente lo que debes configurar en el portal de Azure y los unicos archivos de codigo que debes tocar para que el proyecto cumpla con el 100% de la rubrica de la evaluacion.

---

## Parte 1: Que hacer en Microsoft Azure Portal

Inicia sesion en https://portal.azure.com y busca el servicio **Microsoft Entra ID** (antes Azure Active Directory).

### 1. Registrar la aplicacion Frontend en Azure
1. Ve a **App registrations** y haz clic en **New registration**.
2. Nombre: `Pedidos360-Frontend`.
3. Tipo de cuenta: Selecciona la primera opcion (Single tenant).
4. En **Redirect URI**:
   - Tipo de plataforma: Selecciona **Single-page application (SPA)**.
   - URL: Escribe exactamente `http://localhost:4200`
5. Haz clic en **Register**.
6. En la pantalla principal que aparece, copia:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### 2. Registrar la aplicacion Backend y crear el Scope
1. Ve nuevamente a **App registrations** y haz clic en **New registration**.
2. Nombre: `Pedidos360-Backend`.
3. Tipo de cuenta: Single tenant.
4. Clic en **Register**.
5. En el menu izquierdo de esta aplicacion, entra a **Expose an API**.
6. Al lado de **Application ID URI**, haz clic en **Add** (o Set) y guarda el valor por defecto (`api://<client-id>`).
7. Haz clic en **Add a scope**:
   - Scope name: `access_as_user`
   - Who can consent: Admins and users
   - Admin consent display name: Acceso API Pedidos360
   - Admin consent description: Permite consumir la API
   - State: Enabled
8. Haz clic en **Add scope**.

### 3. Crear los Roles exigidos por la rubrica (App Roles)
La rubrica exige que el token contenga roles y que el backend los valide:
1. En el menu izquierdo del backend (**Pedidos360-Backend**), entra a **App roles**.
2. Haz clic en **Create app role**:
   - Display name: Administrador
   - Allowed member types: Users/Groups
   - Value: `Pedidos.Admin`
   - Description: Rol administrador
   - Marca la casilla de habilitar y haz clic en **Apply**.
3. Crea un segundo rol con el mismo procedimiento:
   - Display name: Operador
   - Allowed member types: Users/Groups
   - Value: `Pedidos.Operador`
   - Description: Rol operador
   - Clic en **Apply**.

### 4. Asignar los Roles a tu usuario
1. En el menu principal de **Microsoft Entra ID**, entra a **Enterprise applications**.
2. Busca y abre **Pedidos360-Backend**.
3. Ve a **Users and groups** y haz clic en **Add user/group**.
4. Selecciona tu usuario y el de tu companero.
5. En **Select a role**, elige `Pedidos.Admin` (o `Pedidos.Operador`) y haz clic en **Assign**.

### 5. Dar permisos al Frontend para llamar al Backend
1. Vuelve a **App registrations** y abre la aplicacion **Pedidos360-Frontend**.
2. Ve a **API permissions** -> **Add a permission** -> pestana **My APIs**.
3. Selecciona **Pedidos360-Backend**, marca el permiso `access_as_user` y haz clic en **Add permissions**.
4. Si te aparece la opcion, haz clic en **Grant admin consent**.

---

## Parte 2: Que modificar en el codigo del proyecto

Solo debes reemplazar los identificadores en dos archivos:

### 1. En el Frontend: `frontend/src/environments/environment.ts`
Busca las siguientes lineas al inicio del archivo y pega tus datos de Azure:

```typescript
azure: {
  clientId: 'PEGA_AQUI_EL_CLIENT_ID_DEL_FRONTEND',
  tenantId: 'PEGA_AQUI_EL_TENANT_ID',
  authority: 'https://login.microsoftonline.com/PEGA_AQUI_EL_TENANT_ID',
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200/login',
  scopes: ['api://PEGA_AQUI_EL_CLIENT_ID_DEL_BACKEND/access_as_user', 'User.Read'],
}
```

### 2. En el Backend: `backend/src/main/resources/application.yml`
Busca las siguientes lineas al inicio del archivo y pega tus datos:

```yaml
azure:
  activedirectory:
    tenant-id: PEGA_AQUI_EL_TENANT_ID
    client-id: PEGA_AQUI_EL_CLIENT_ID_DEL_BACKEND
    app-id-uri: api://PEGA_AQUI_EL_CLIENT_ID_DEL_BACKEND
```

---

## Como comprobar que todo funciona segun la rubrica

1. Levanta el proyecto con Docker (`docker compose up --build`) o con `npm start` en frontend y `mvn spring-boot:run` en backend.
2. Abre `http://localhost:4200` e inicia sesion con tu cuenta de Microsoft Azure.
3. Entra a la opcion **Inspector de Tokens** del menu:
   - Debes ver que el claim `roles` tenga `Pedidos.Admin` u `Pedidos.Operador`.
   - Debes ver el claim `scp` con `access_as_user`.
   - Debes ver el emisor `iss` con la URL de tu tenant y audiencia `aud`.
4. Entra a la opcion **Consola API Gateway** y haz clic en **Ejecutar Peticion**:
   - Comprobara que el token viaja en la cabecera `Authorization: Bearer` y que el backend valida la firma, emisor y rol con exito.
