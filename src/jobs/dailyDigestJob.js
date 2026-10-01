// Requiere: npm install node-cron
import cron from "node-cron";
import "dotenv/config";
import { obtenerDigestDelDia } from "../services/pesadasDigestService.js";
import { construirDigestHtml } from "../templates/dailyDigestTemplate.js";
import { enviarCorreo } from "../services/emailService.js";

const DESTINATARIO = process.env.DIGEST_EMAIL_TO || "nmatonti@servieco.com.ar";

export async function ejecutarDigestDiario() {
  try {
    const digest = await obtenerDigestDelDia();
    const html = construirDigestHtml(digest);

    await enviarCorreo({
      to: DESTINATARIO,
      cc: [
        "lmatonti@servieco.com.ar",
        "gestionservieco@gmail.com",
        "claracant123@gmail.com",
        "logistica@servieco.com.ar",
        "administracion@servieco.com.ar",
        "transporte@servieco.com.ar"
      ],
      subject: `Reporte diario de pesadas - ${digest.fecha} (${digest.cantidadPesadas} pesadas)`,
      html,
    });

    console.log(`[dailyDigestJob] Digest enviado a ${DESTINATARIO} - ${digest.cantidadPesadas} pesadas`);
  } catch (error) {
    console.error("[dailyDigestJob] Error al generar/enviar el digest diario:", error);
  }
}

export function iniciarJobDigestDiario() {
  // Todos los días a las 19:00, hora configurada. Ajustá el cron si necesitás otro horario.
  // Formato: minuto hora díaMes mes díaSemana
  cron.schedule("0 19 * * *", ejecutarDigestDiario, {
    timezone: "America/Argentina/Buenos_Aires",
  });

  console.log("[dailyDigestJob] Job de digest diario programado (19:00 America/Argentina/Buenos_Aires)");
}