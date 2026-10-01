import cron from "node-cron";
import "dotenv/config";

import { construirReporteSemanalHtml } from "../templates/reporteSemanalDescargas.js";
import { obtenerDigestDelRango } from "../services/pesadasDigestService.js";
import { enviarCorreo } from "../services/emailService.js";

const DESTINATARIO =
  process.env.DIGEST_EMAIL_TO || "nmatonti@servieco.com.ar";

// Domingo -> sábado de la semana actual
function obtenerRangoSemanaActual() {
  const hoy = new Date();

  const diaSemana = hoy.getDay(); // 0 = domingo ... 6 = sábado

  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() - diaSemana);
  domingo.setHours(0, 0, 0, 0);

  const sabado = new Date(domingo);
  sabado.setDate(domingo.getDate() + 6);
  sabado.setHours(23, 59, 59, 999);

  const formatear = (fecha) => {
    return fecha.toISOString().slice(0, 10);
  };

  return {
    fechaInicio: formatear(domingo),
    fechaFin: formatear(sabado),
  };
}

export async function ejecutarReporteDescargasSemanal() {
  try {
    const { fechaInicio, fechaFin } = obtenerRangoSemanaActual();

    console.log(
      `[weeklyDischargeReportJob] Generando reporte semanal ${fechaInicio} a ${fechaFin}...`
    );

    const digest = await obtenerDigestDelRango(
      fechaInicio,
      fechaFin
    );

    const html = construirReporteSemanalHtml(digest);

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

      subject: `Reporte semanal de pesadas - ${fechaInicio} a ${fechaFin}`,

      html,
    });

    console.log(
      `[weeklyDischargeReportJob] Reporte semanal enviado a ${DESTINATARIO} (${fechaInicio} a ${fechaFin})`
    );
  } catch (error) {
    console.error(
      "[weeklyDischargeReportJob] Error al generar/enviar el reporte semanal:",
      error
    );
  }
}

export function iniciarJobReporteDescargasSemanal() {
  cron.schedule(
    "0 18 * * 6",
    ejecutarReporteDescargasSemanal,
    {
      timezone: "America/Argentina/Buenos_Aires",
    }
  );

  console.log(
    "[weeklyDischargeReportJob] Job de reporte semanal programado (sábados 18:00 America/Argentina/Buenos_Aires)"
  );
}