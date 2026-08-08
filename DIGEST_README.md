# Digest diario de pesadas por correo

## 1. Instalar dependencias nuevas

```bash
npm install nodemailer node-cron
```

## 2. Variables de entorno (agregar a tu `.env`)

```env
# SMTP - ejemplo para Office365 / Outlook
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_cuenta@servieco.com.ar
SMTP_PASS=tu_password_o_app_password
SMTP_FROM=tu_cuenta@servieco.com.ar

# Destinatario del digest (opcional, por defecto nmatonti@servieco.com.ar)
DIGEST_EMAIL_TO=nmatonti@servieco.com.ar

# Zona horaria del cron (opcional)
DIGEST_TIMEZONE=America/Argentina/Buenos_Aires
```

Notas sobre Office365/Outlook:
- Si tu organización usa autenticación moderna (OAuth2) o tiene MFA activado, el usuario/contraseña simple puede no funcionar. En ese caso necesitás una "contraseña de aplicación" o configurar OAuth2 con nodemailer, o bien usar un servicio SMTP relay (SendGrid, Amazon SES, Mailgun, etc.) — la única parte que cambiaría es `src/services/emailService.js`.

## 2.5. Ya integrado con tu `db.js`

`pesadasDigestService.js` importa `{ sequelize }` desde `../config/db.js` (tal cual tu archivo actual) y ejecuta las consultas con `sequelize.query(..., { type: QueryTypes.SELECT })`. No necesitás tocar `db.js`.

## 3. Ubicación de los archivos

```
backend-pesaje/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── services/
│   │   ├── pesadasDigestService.js   ← nuevo
│   │   └── emailService.js           ← nuevo
│   ├── templates/
│   │   └── dailyDigestTemplate.js    ← nuevo
│   └── jobs/
│       └── dailyDigestJob.js         ← nuevo
├── DIGEST_README.md
└── package.json
```

## 4. Iniciar el job al levantar el servidor

En `src/app.js` (después de conectar la DB con `connectDB()`):

```js
import { iniciarJobDigestDiario } from "./jobs/dailyDigestJob.js";

await connectDB();
iniciarJobDigestDiario();
```

## 5. Probar manualmente

```js
import { ejecutarDigestDiario } from "./jobs/dailyDigestJob.js";
await ejecutarDigestDiario();
```

## Qué incluye el correo

- Cantidad total de pesadas del día (estado `CERRADA` o `CERRADA_AUTOMATICA`)
- Total de kg netos del día
- Totales de kg y cantidad de pesadas agrupados por material
- Detalle fila por fila de cada pesada: fecha/hora, movimiento, empresa, material, patente, personal, peso neto y estado

Todo se calcula a partir de la vista `vw_pesadas_con_neto` que ya tenés en tu esquema, que resuelve el peso neto real o estimado según corresponda.