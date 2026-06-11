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
