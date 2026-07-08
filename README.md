# Backend Pesaje

Backend de la aplicación de pesaje con Express, Sequelize y MySQL.

## Requisitos
- Node.js 18 o superior
- MySQL
- npm

## Instalación
1. Instala dependencias:
   npm install
2. Asegúrate de tener tu archivo .env configurado en la raíz del proyecto.
3. Ajusta los valores de la base de datos y del puerto en .env.

## Ejecución
- Desarrollo:
  npm run dev
- Producción:
  npm start

## Variables de entorno
Usa tu archivo .env existente con estas variables:
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- PORT
- CORS_ORIGIN
- MANUAL_AUTH_PASSWORD

## API
La API queda expuesta en:
- /api/...
- /api/v1/...

La ruta /api/v1/ es la recomendada para integraciones nuevas.

## Mejora aplicada
- Arranque configurable con variables de entorno
- Seguridad básica con helmet y rate limiting
- Versionado de rutas
- Configuración centralizada para CORS

## Endpoints disponibles

Todos los recursos están disponibles tanto en `/api/...` como en `/api/v1/...` (se recomienda usar la versión `/v1`).

| Recurso              | Base path                  | Descripción                          |
|-----------------------|-----------------------------|----------------------------------------|
| Empresas               | `/empresas`                | Gestión de empresas                    |
| Personal               | `/personal`                | Gestión de personal                    |
| Materiales             | `/materiales`               | Gestión de materiales                  |
| Vehículos              | `/vehiculos`                | Gestión de vehículos                   |
| Cajas                  | `/cajas`                    | Gestión de cajas                       |
| Pesadas                | `/pesadas`                  | Registro y consulta de pesadas         |
| Balanza                | `/balanza`                  | Integración con balanza                |
| Tipos de vehículo      | `/tipos_vehiculo`           | Catálogo de tipos de vehículo          |
| Inventario             | `/inventario`               | Gestión de inventario                  |
| Exportaciones          | `/export`                   | Exportación de datos                   |
| Login / Usuarios       | `/login`                    | Autenticación de usuarios              |
| Tipos de caja          | `/tipos_caja`               | Catálogo de tipos de caja              |
| Descargas              | `/descargas`                | Gestión de descargas                   |
| Materiales de descarga | `/materiales_descarga`      | Materiales asociados a descargas       |
| Stock                  | `/stock`                    | Gestión de stock                       |
| Roles                  | `/roles`                    | Gestión de roles de usuario            |

Ejemplo: `GET /api/v1/pesadas` lista las pesadas registradas.
