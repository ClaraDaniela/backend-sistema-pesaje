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
  // Lunes a sábado a las 19:00 (los domingos no se envía).
  // Formato: minuto hora díaMes mes díaSemana (0 = domingo, 1-6 = lunes a sábado)
  cron.schedule("0 19 * * 1-6", ejecutarDigestDiario, {
    timezone: "America/Argentina/Buenos_Aires",
  });

  console.log("[dailyDigestJob] Job de digest programado (lunes a sábado, 19:00 America/Argentina/Buenos_Aires)");
}