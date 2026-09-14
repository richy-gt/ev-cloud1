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
## Estructura del proyecto

- `frontend/`: Aplicacion en Angular con MSAL, guards, interceptores y vistas del sistema.
- `backend/`: Microservicio en Java Spring Boot con Spring Security, JPA y validacion de tokens JWT.
- `docker-compose.yml`: Archivo para levantar base de datos, backend y frontend juntos.
- `GUIA_CONFIGURACION_AZURE.md`: Guia paso a paso para la configuracion en Azure Portal.
