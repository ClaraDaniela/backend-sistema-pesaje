// src/jobs/ReporteMensualMateriales.js
// Resumen mensual del mes anterior: ingreso y egreso por categoría general, y el ingreso
// clasificado por tipo de material y material base (según la descarga).
// Se envía a UNA persona el día 1 de cada mes a las 08:00 (hora Argentina).
// Se activa llamando a iniciarReporteMensualMateriales() desde startServer() en app.js.

import cron from 'node-cron';
import { QueryTypes } from 'sequelize';
import * as dbModule from '../config/db.js';
import { enviarCorreo } from '../services/emailService.js';

// Conexión a la base de pesadas (misma resolución que usa el controller de ubicaciones)
const sequelize = dbModule.default ?? dbModule.sequelize ?? dbModule.db ?? dbModule.pesadasDb;

// Destinatario único: poné REPORTE_MENSUAL_TO=persona@empresa.com en el .env
const DESTINATARIO = (process.env.REPORTE_MENSUAL_TO || '').trim();

// Peso neto de cada pesada: real si se pesó vacío, si no el estimado (mismo criterio que vw_ingreso_por_tipo_material)
const NETO = 'COALESCE(n.peso_neto_real_kg, n.peso_neto_estimado_kg)';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const kg = (n) => Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });

const pad = (n) => String(n).padStart(2, '0');
const fmtSql = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 00:00:00`;

// Mes anterior completo: [desde, hasta)
function rangoMesAnterior() {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return { desde, hasta };
}

async function obtenerDatos(desde, hasta) {
  if (!sequelize) {
    throw new Error('No encuentro la conexión de pesadas en src/config/db.js (revisá cómo la exporta)');
  }
  const replacements = { desde: fmtSql(desde), hasta: fmtSql(hasta) };
  const consulta = (sql) => sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

  const [porCategoria, clasificado, pendiente] = await Promise.all([
    // 1) Ingreso y egreso por categoría general
    consulta(`
      SELECT mg.nombre AS categoria,
             SUM(CASE WHEN p.tipo_movimiento = 'INGRESO' THEN ${NETO} ELSE 0 END) AS ingreso_kg,
             SUM(CASE WHEN p.tipo_movimiento = 'EGRESO'  THEN ${NETO} ELSE 0 END) AS egreso_kg,
             SUM(p.tipo_movimiento = 'INGRESO') AS pesadas_ingreso,
             SUM(p.tipo_movimiento = 'EGRESO')  AS pesadas_egreso
        FROM pesadas p
        JOIN vw_pesadas_con_neto n ON n.id = p.id
        JOIN materiales_generales mg ON mg.id = p.material_general_id
       WHERE COALESCE(p.eliminado, 0) = 0
         AND p.fecha >= :desde AND p.fecha < :hasta
       GROUP BY mg.id, mg.nombre
       ORDER BY mg.nombre`),

    // 2) Ingreso clasificado en la descarga: categoría -> tipo de material -> material base
    consulta(`
      SELECT mg.nombre AS categoria,
             tm.nombre AS tipo,
             COALESCE(mb.nombre, '(sin material base)') AS material,
             SUM(${NETO} * ddm.porcentaje / 100) AS kg
        FROM pesadas p
        JOIN vw_pesadas_con_neto n ON n.id = p.id
        JOIN descarga_detalles dd ON dd.pesada_id = p.id
        JOIN descarga_detalles_materiales ddm ON ddm.id_descarga_detalles = dd.id_descarga_detalles
        JOIN materiales m ON m.id_materiales_descarga = ddm.id_materiales
        JOIN tipos_material tm ON tm.id = m.tipo_material_id
        LEFT JOIN materiales_base mb ON mb.id = m.material_base_id
        JOIN materiales_generales mg ON mg.id = p.material_general_id
       WHERE COALESCE(p.eliminado, 0) = 0
         AND p.tipo_movimiento = 'INGRESO'
         AND p.fecha >= :desde AND p.fecha < :hasta
       GROUP BY mg.id, mg.nombre, tm.id, tm.nombre, mb.id, mb.nombre
       ORDER BY mg.nombre, tm.nombre, mb.nombre`),

    // 3) Ingresos que todavía no tienen descarga cargada
    consulta(`
      SELECT COALESCE(SUM(${NETO}), 0) AS kg, COUNT(*) AS pesadas
        FROM pesadas p
        JOIN vw_ingreso_pendiente n ON n.id = p.id
       WHERE COALESCE(p.eliminado, 0) = 0
         AND p.fecha >= :desde AND p.fecha < :hasta`),
  ]);

  return { porCategoria, clasificado, pendiente: pendiente[0] || { kg: 0, pesadas: 0 } };
}

const TH = 'style="background:#f0f0f0"';
const NUM = 'style="text-align:right"';
const TABLA = 'border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px"';

function tablaCategorias(rows) {
  if (rows.length === 0) return '<p>No hay pesadas en el período.</p>';

  const tot = rows.reduce(
    (a, r) => ({
      ingreso: a.ingreso + Number(r.ingreso_kg || 0),
      egreso: a.egreso + Number(r.egreso_kg || 0),
      pi: a.pi + Number(r.pesadas_ingreso || 0),
      pe: a.pe + Number(r.pesadas_egreso || 0),
    }),
    { ingreso: 0, egreso: 0, pi: 0, pe: 0 }
  );

  const filas = rows.map((r) => `
    <tr>
      <td>${esc(r.categoria)}</td>
      <td ${NUM}>${kg(r.ingreso_kg)}</td>
      <td ${NUM}>${kg(r.egreso_kg)}</td>
      <td ${NUM}>${Number(r.pesadas_ingreso || 0)}</td>
      <td ${NUM}>${Number(r.pesadas_egreso || 0)}</td>
    </tr>`).join('');

  return `
    <table ${TABLA}>
      <thead>
        <tr><th ${TH}>Categoría</th><th ${TH}>Ingreso (kg)</th><th ${TH}>Egreso (kg)</th>
            <th ${TH}>Pesadas ingreso</th><th ${TH}>Pesadas egreso</th></tr>
      </thead>
      <tbody>
        ${filas}
        <tr>
          <td><b>TOTAL</b></td>
          <td ${NUM}><b>${kg(tot.ingreso)}</b></td>
          <td ${NUM}><b>${kg(tot.egreso)}</b></td>
          <td ${NUM}><b>${tot.pi}</b></td>
          <td ${NUM}><b>${tot.pe}</b></td>
        </tr>
      </tbody>
    </table>`;
}

function tablaClasificado(rows, pendiente) {
  // categoría -> tipo -> [materiales]
  const cats = new Map();
  for (const r of rows) {
    if (!cats.has(r.categoria)) cats.set(r.categoria, new Map());
    const tipos = cats.get(r.categoria);
    if (!tipos.has(r.tipo)) tipos.set(r.tipo, []);
    tipos.get(r.tipo).push(r);
  }

  let totalClasificado = 0;
  let cuerpo = '';

  for (const [categoria, tipos] of cats) {
    let subCategoria = 0;
    let bloque = '';
    for (const [tipo, items] of tipos) {
      const subTipo = items.reduce((a, i) => a + Number(i.kg || 0), 0);
      subCategoria += subTipo;
      bloque += `<tr><td style="background:#eef3ee"><b>${esc(tipo)}</b></td>
                     <td ${NUM} style="background:#eef3ee;text-align:right"><b>${kg(subTipo)}</b></td></tr>`;
      bloque += items.map((i) => `
        <tr><td style="padding-left:24px">${esc(i.material)}</td><td ${NUM}>${kg(i.kg)}</td></tr>`).join('');
    }
    totalClasificado += subCategoria;
    cuerpo += `<tr><td colspan="2" style="background:#dfe8df"><b>${esc(categoria)}</b> — ${kg(subCategoria)} kg</td></tr>${bloque}`;
  }

  const filaPendiente = Number(pendiente.pesadas) > 0
    ? `<tr><td><i>Pendiente de descarga (${Number(pendiente.pesadas)} pesadas)</i></td><td ${NUM}><i>${kg(pendiente.kg)}</i></td></tr>`
    : '';

  if (rows.length === 0 && !filaPendiente) {
    return '<p>No hay ingresos clasificados en el período.</p>';
  }

  return `
    <table ${TABLA}>
      <thead><tr><th ${TH}>Tipo / material</th><th ${TH}>Ingreso (kg)</th></tr></thead>
      <tbody>
        ${cuerpo}
        <tr><td><b>Total clasificado</b></td><td ${NUM}><b>${kg(totalClasificado)}</b></td></tr>
        ${filaPendiente}
      </tbody>
    </table>`;
}

function construirReporteMensualHtml({ porCategoria, clasificado, pendiente }, desde, hasta) {
  const ultimoDia = new Date(hasta.getTime() - 1);
  const periodo = desde.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return `
    <h2>Resumen mensual de materiales - ${esc(periodo)}</h2>
    <p>Del ${desde.toLocaleDateString('es-AR')} al ${ultimoDia.toLocaleDateString('es-AR')}. Valores en kg netos.</p>

    <h3>Ingreso y egreso por categoría</h3>
    ${tablaCategorias(porCategoria)}

    <h3>Ingreso clasificado por tipo de material</h3>
    <p style="font-size:12px;color:#555">Según la composición cargada en cada descarga. El egreso solo se registra por categoría.</p>
    ${tablaClasificado(clasificado, pendiente)}`;
}

export async function enviarReporteMensualMateriales() {
  if (!DESTINATARIO) {
    console.warn('[reporteMensualMateriales] falta REPORTE_MENSUAL_TO, no se envía');
    return;
  }

  const { desde, hasta } = rangoMesAnterior();
  const datos = await obtenerDatos(desde, hasta);
  const html = construirReporteMensualHtml(datos, desde, hasta);
  const periodo = desde.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  await enviarCorreo({
    to: DESTINATARIO,
    subject: `Resumen mensual de materiales - ${periodo}`,
    html,
  });
}

// Día 1 de cada mes a las 08:00
export function iniciarReporteMensualMateriales() {
  cron.schedule(
    '0 8 1 * *',
    async () => {
      try {
        await enviarReporteMensualMateriales();
        console.log('[reporteMensualMateriales] enviado');
      } catch (e) {
        console.error('[reporteMensualMateriales] error:', e);
      }
    },
    { timezone: 'America/Argentina/Buenos_Aires' }
  );
}