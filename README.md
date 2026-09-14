# Pedidos360 - Evaluacion Cloud Native I (Duoc UC)

Este proyecto es la solucion para la Evaluacion Parcial N° 1 de Cloud Native. Es un sistema de gestion de pedidos llamado Pedidos360, compuesto por un frontend en Angular con autenticacion MSAL (Azure AD) y un backend en Spring Boot (Java) protegido con OAuth2 Resource Server y base de datos relacional.

---

## Como levantar todo rapido con Docker

La forma mas sencilla de correr todo el sistema (base de datos PostgreSQL, backend y frontend) es con Docker Compose:

```bash
docker compose up --build
```

Una vez que termine de compilar y levantar los contenedores:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api/health
- Base de datos PostgreSQL: puerto 5432

Para detener los servicios:
```bash
docker compose down
```

---

## Como correrlo de forma manual (sin Docker)

Si prefieres correr los proyectos por separado en tu maquina:

### 1. Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Se abrira en http://localhost:4200.

### 2. Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
El servidor arrancara en http://localhost:8080. Si no tienes PostgreSQL corriendo localmente, puedes usar la base de datos en memoria H2 de prueba.

---

## Modo Demostracion Local (para probar de inmediato)

No te preocupes si la parte de Azure todavia no esta configurada:
- La aplicacion cuenta con un modo de simulacion automatico.
- Al abrir la pagina puedes hacer clic en "Ingresar en Modo Demostracion Local".
- Te permitira ver el dashboard, crear pedidos, cambiar estados, revisar el Inspector de Tokens con claims realistas (roles, scopes, vigencia) y probar las llamadas en la Consola API Gateway.
- En cuanto tu companero configure Azure y pegue los identificadores, la pagina pasara a usar el login oficial de Microsoft Entra ID.

---

## Para la persona que hace la parte de Azure

Todo lo que esa persona debe hacer en el portal de Azure y los dos archivos que debe tocar en el proyecto estan explicados de forma directa y paso a paso en el archivo:
`GUIA_CONFIGURACION_AZURE.md`

Resumen para Azure:
1. En el frontend: poner el Client ID y Tenant ID en `frontend/src/environments/environment.ts`.
2. En el backend: poner los mismos datos en `backend/src/main/resources/application.yml`.
3. En Azure Portal: registrar la app frontend (SPA), el backend (exponer scope `access_as_user`) y crear los roles `Pedidos.Admin` y `Pedidos.Operador`.

---

## Estructura del proyecto

- `frontend/`: Aplicacion en Angular con MSAL, guards, interceptores y vistas del sistema.
- `backend/`: Microservicio en Java Spring Boot con Spring Security, JPA y validacion de tokens JWT.
- `docker-compose.yml`: Archivo para levantar base de datos, backend y frontend juntos.
- `GUIA_CONFIGURACION_AZURE.md`: Guia paso a paso para la configuracion en Azure Portal.
