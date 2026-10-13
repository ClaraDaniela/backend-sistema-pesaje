// src/jobs/ReporteUbicaciones.js
// Reporte de ubicaciones por tracker (formato tabla). Horarios definidos en HORARIOS (hora Argentina).
// Se activa llamando a iniciarReporteUbicaciones() desde startServer() en app.js.

import cron from 'node-cron';
import { Op } from 'sequelize';
import { Tracker, LocationLog } from '../config/tracking.js';
import { enviarCorreo } from '../services/emailService.js';
import { distanciaM } from '../controllers/utils/geo.js';

// 'hoy' = solo los logs del día   |   'todos' = todo el historial
const ALCANCE = 'hoy';
const DESTINATARIOS = (process.env.REPORTE_UBICACIONES_TO || '').split(',').map((s) => s.trim()).filter(Boolean);

// Distancia mínima (en metros) para considerar que hubo un cambio de ubicación
const UMBRAL_METROS = 100;

// Formato cron. Ej: ['0 11 * * *', '5 23 * * *'] para 11:00 y 23:05
const HORARIOS = ['5 23 * * *'];

const TZ = 'America/Argentina/Buenos_Aires';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtFecha = (d) => new Date(d).toLocaleString('es-AR', { timeZone: TZ });

const fmtDia = (d) => new Date(d).toLocaleDateString('es-AR', { timeZone: TZ });

const normalizar = (s) => String(s ?? '').trim().toLowerCase();

// Fecha desde la que el tracker está asociado a su caja (acepta cajaDesde o caja_desde)
const desdeDe = (t) => t.cajaDesde ?? t.caja_desde ?? null;

// { cambio: boolean|null, metros: number|null }  (null = no hay datos comparables)
const compararUbicacion = (prev, actual) => {
  if (!prev) return { cambio: null, metros: null };

  const ambosConCoords =
    prev.lat != null && prev.lng != null && actual.lat != null && actual.lng != null;

  if (ambosConCoords) {
    const metros = distanciaM(
      Number(prev.lat), Number(prev.lng),
      Number(actual.lat), Number(actual.lng)
    );
    return { cambio: metros > UMBRAL_METROS, metros };
  }

  // validarLog permite cargar solo "place" sin coordenadas: comparo por texto
  if (normalizar(prev.place) || normalizar(actual.place)) {
    return { cambio: normalizar(prev.place) !== normalizar(actual.place), metros: null };
  }

  return { cambio: null, metros: null };
};

const fmtDistancia = (m) =>
  m == null ? '' : m >= 1000 ? ` (${(m / 1000).toFixed(1)} km)` : ` (${Math.round(m)} m)`;

// Recibe los logs del tracker de más nuevo a más viejo.
// Cuenta hacia atrás mientras sigan dentro del umbral respecto de la última ubicación.
const diasQuieto = (logsDesc) => {
  const ultimo = logsDesc[0];
  if (!ultimo) return null;

  let desde = ultimo;
  for (const l of logsDesc.slice(1)) {
    if (compararUbicacion(ultimo, l).cambio !== false) break; // se movió o no es comparable
    desde = l;
  }

  const dias = Math.floor((Date.now() - new Date(desde.recordedAt).getTime()) / 86400000);
  return { dias, desde: desde.recordedAt };
};

async function obtenerDatos() {
  const where = {};
  let inicio = null;
  if (ALCANCE === 'hoy') {
    inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    where.recordedAt = { [Op.between]: [inicio, fin] };
  }

  const [trackers, logs] = await Promise.all([
    Tracker.findAll({ where: { activo: true }, order: [['codigo', 'ASC']], raw: true }),
    LocationLog.findAll({ where, order: [['recordedAt', 'ASC']], raw: true }),
  ]);

  // Último log anterior al período (y posterior a que se asoció la caja actual),
  // referencia para el primer log del día
  const previos = inicio
    ? await Promise.all(
        trackers.map((t) => {
          const desde = desdeDe(t);
          return LocationLog.findOne({
            where: {
              trackerId: t.codigo,
              recordedAt: { [Op.lt]: inicio, ...(desde && { [Op.gte]: desde }) },
            },
            order: [['recordedAt', 'DESC']],
            raw: true,
          });
        })
      )
    : trackers.map(() => null);

  // Historial desde que se asoció la caja, para contar los días quieto
  const historiales = await Promise.all(
    trackers.map((t) => {
      const desde = desdeDe(t);
      return LocationLog.findAll({
        where: {
          trackerId: t.codigo,
          ...(desde && { recordedAt: { [Op.gte]: desde } }),
        },
        order: [['recordedAt', 'DESC']],
        limit: 1000,
        raw: true,
      });
    })
  );

  return trackers.map((t, i) => {
    const logsT = logs.filter((l) => l.trackerId === t.codigo);
    let anterior = previos[i];
    const conCambio = logsT.map((l) => {
      const cmp = compararUbicacion(anterior, l);
      anterior = l;
      return { ...l, ...cmp };
    });
    return {
      codigo: t.codigo,
      patente: t.patente, // código de la caja
      quieto: diasQuieto(historiales[i]),
      ultimo: historiales[i][0] ?? null, // última ubicación conocida
      logs: conCambio,
      cambios: conCambio.filter((l) => l.cambio === true).length,
    };
  });
}

// ---------- Armado del HTML ----------

const TH = 'background:#2c3e50;color:#fff;text-align:left;padding:6px 10px';
const TD = 'padding:6px 10px;border-bottom:1px solid #ddd';
const TABLA = 'border-collapse:collapse;font-size:13px;width:100%';
const FONDO_CAMBIO = 'background:#fdecea';

const linkMapa = (l) =>
  l.lat != null
    ? `<a href="https://www.google.com/maps?q=${l.lat},${l.lng}">${esc(l.plusCode || 'Ver mapa')}</a>`
    : esc(l.plusCode || '-');

const textoQuieto = (q) =>
  q ? (q.dias > 0 ? `${q.dias} día(s) (desde ${fmtDia(q.desde)})` : 'Reciente') : 'Sin datos';

const celdaEstado = (l) =>
  l.cambio === null
    ? '<span style="color:#888">Sin ubicación previa</span>'
    : l.cambio
      ? `<b style="color:#c0392b">Cambió${fmtDistancia(l.metros)}</b>`
      : '<span style="color:#27ae60">Sin cambio</span>';

function tablaResumen(grupos) {
  const filas = grupos.map((g) => {
    const huboCambio = g.cambios > 0;
    const estado = huboCambio
      ? `<b style="color:#c0392b">⚠ Cambió (${g.cambios})</b>`
      : '<span style="color:#27ae60">Sin cambios</span>';
    const ult = g.ultimo
      ? `${esc(g.ultimo.place) || '-'} · ${linkMapa(g.ultimo)}<br/><small style="color:#888">${fmtFecha(g.ultimo.recordedAt)}</small>`
      : '<span style="color:#888">Sin ubicaciones</span>';

    return `<tr style="${huboCambio ? FONDO_CAMBIO : ''}">
      <td style="${TD}"><b>${esc(g.codigo)}</b></td>
      <td style="${TD}">${esc(g.patente) || '-'}</td>
      <td style="${TD}">${estado}</td>
      <td style="${TD}">${esc(textoQuieto(g.quieto))}</td>
      <td style="${TD}">${ult}</td>
    </tr>`;
  }).join('');

  return `<h3>Resumen</h3>
    <table cellspacing="0" style="${TABLA}">
      <thead><tr>
        <th style="${TH}">Tracker</th><th style="${TH}">Caja</th><th style="${TH}">Estado</th>
        <th style="${TH}">Quieto hace</th><th style="${TH}">Última ubicación</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
}

function tablaDetalle(grupos) {
  const filas = grupos.flatMap((g) =>
    g.logs.map((l) => `<tr style="${l.cambio ? FONDO_CAMBIO : ''}">
        <td style="${TD}"><b>${esc(g.codigo)}</b></td>
        <td style="${TD}">${esc(g.patente) || '-'}</td>
        <td style="${TD}">${fmtFecha(l.recordedAt)}</td>
        <td style="${TD}">${esc(l.place) || '-'}</td>
        <td style="${TD}">${linkMapa(l)}</td>
        <td style="${TD}">${celdaEstado(l)}</td>
        <td style="${TD}">${esc(l.note) || ''}</td>
      </tr>`)
  ).join('');

  if (!filas) return '<p>Sin ubicaciones cargadas en el período.</p>';

  return `<h3>Detalle de ubicaciones del período</h3>
    <table cellspacing="0" style="${TABLA}">
      <thead><tr>
        <th style="${TH}">Tracker</th><th style="${TH}">Caja</th><th style="${TH}">Fecha</th>
        <th style="${TH}">Lugar</th><th style="${TH}">Ubicación</th><th style="${TH}">Cambio</th><th style="${TH}">Nota</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
}

function construirReporteUbicacionesHtml(grupos) {
  if (grupos.length === 0) {
    return '<p>No hay trackers activos.</p>';
  }

  const conCambios = grupos.filter((g) => g.cambios > 0);
  const aviso = conCambios.length
    ? `<p style="background:#fdecea;border-left:4px solid #c0392b;padding:8px 12px">
         <b>⚠ ${conCambios.length} tracker(s) cambiaron de ubicación</b>
       </p>`
    : '<p style="color:#27ae60"><b>Ningún tracker cambió de ubicación.</b></p>';

  return `<h2>Reporte de ubicaciones de trackers</h2>${aviso}${tablaResumen(grupos)}<br/>${tablaDetalle(grupos)}`;
}

export async function enviarReporteUbicaciones() {
  const grupos = await obtenerDatos();
  const html = construirReporteUbicacionesHtml(grupos);
  const fecha = new Date().toLocaleDateString('es-AR', { timeZone: TZ });
  const totalCambios = grupos.reduce((acc, g) => acc + g.cambios, 0);

  await enviarCorreo({
    to: DESTINATARIOS,
    subject: `${totalCambios > 0 ? '⚠ ' : ''}Reporte de ubicaciones de trackers - ${fecha}${totalCambios > 0 ? ` (${totalCambios} cambio(s))` : ''}`,
    html,
  });
}

// Programa el envío en cada horario de HORARIOS
export function iniciarReporteUbicaciones() {
  HORARIOS.forEach((horario) => {
    cron.schedule(
      horario,
      async () => {
        try {
          await enviarReporteUbicaciones();
          console.log(`[reporteUbicaciones] enviado (${horario})`);
        } catch (e) {
          console.error('[reporteUbicaciones] error:', e);
        }
      },
      { timezone: TZ }
    );
  });
}