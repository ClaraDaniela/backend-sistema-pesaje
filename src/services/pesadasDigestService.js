import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";

/**
 * Obtiene el digest de pesadas de un día determinado (por defecto, hoy).
 * Usa la vista vw_pesadas_con_neto, que ya trae el peso neto calculado
 * (real si se pesó vacío, o estimado por tara teórica si no).
 *
 * vw_pesadas_con_neto no incluye el campo `eliminado` (borrado lógico),
 * así que se hace JOIN con la tabla `pesadas` para poder excluir las
 * pesadas borradas.
 *
 * @param {string|null} fecha - Fecha en formato 'YYYY-MM-DD'. Si es null, usa CURDATE().
 */
export async function obtenerDigestDelDia(fecha = null) {
  const condicionFecha = fecha ? "DATE(v.fecha) = :fecha" : "DATE(v.fecha) = CURDATE()";
  const replacements = fecha ? { fecha } : {};

  const pesadas = await sequelize.query(
    `SELECT
        v.id,
        v.fecha,
        v.estado,
        v.tipo_movimiento,
        v.empresa,
        v.material,
        v.personal_nombre,
        v.personal_apellido,
        v.patente,
        v.tipo_vehiculo,
        v.id_caja,
        v.tipo_caja,
        v.origen,
        v.nro_manifiesto,
        v.nro_remito,
        v.peso_bruto_kg,
        v.peso_declarado_kg,
        COALESCE(v.peso_neto_real_kg, v.peso_neto_estimado_kg) AS peso_neto_kg,
        v.dentro_tolerancia
     FROM vw_pesadas_con_neto v
     JOIN pesadas p ON p.id = v.id
     WHERE ${condicionFecha}
       AND v.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
       AND (p.eliminado = 0 OR p.eliminado IS NULL)
     ORDER BY v.fecha ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalGeneralKg = pesadas.reduce(
    (acc, row) => acc + Number(row.peso_neto_kg || 0),
    0
  );

  const idsPesadas = pesadas.map((p) => p.id);

  let materialesDescarga = [];
  if (idsPesadas.length > 0) {
    materialesDescarga = await sequelize.query(
      `SELECT
          dd.pesada_id,
          dd.comentarios,
          tm.nombre AS tipo_material_descarga,
          mb.nombre AS material_base_descarga,
          fm.nombre AS forma_material_descarga,
          ddm.porcentaje
       FROM descarga_detalles dd
       JOIN descarga_detalles_materiales ddm
         ON ddm.id_descarga_detalles = dd.id_descarga_detalles
       JOIN materiales m
         ON m.id_materiales_descarga = ddm.id_materiales
       LEFT JOIN tipos_material   tm ON tm.id = m.tipo_material_id
       LEFT JOIN materiales_base  mb ON mb.id = m.material_base_id
       LEFT JOIN formas_material  fm ON fm.id = m.forma_material_id
       WHERE dd.pesada_id IN (:idsPesadas)`,
      { replacements: { idsPesadas }, type: QueryTypes.SELECT }
    );
  }

  const materialesPorPesada = new Map();
  for (const row of materialesDescarga) {
    if (!materialesPorPesada.has(row.pesada_id)) {
      materialesPorPesada.set(row.pesada_id, []);
    }
    materialesPorPesada.get(row.pesada_id).push(row);
  }

  for (const p of pesadas) {
    const items = materialesPorPesada.get(p.id) || [];
    p.materiales_descarga = items;
    p.comentarios = items[0]?.comentarios ?? null;
  }

  return {
    fecha: fecha || new Date().toISOString().slice(0, 10),
    cantidadPesadas: pesadas.length,
    totalGeneralKg,
    pesadas,
  };
}

/**
 * Obtiene el digest de pesadas de un rango de fechas (inclusive).
 * Mismo shape que obtenerDigestDelDia, más un resumen por tipo de
 * vehículo (`tiposCamion`) que cuenta CAMIONES DISTINTOS (patentes
 * únicas), no cantidad de viajes/pesadas.
 *
 * @param {string} fechaInicio - 'YYYY-MM-DD'
 * @param {string} fechaFin - 'YYYY-MM-DD'
 */
export async function obtenerDigestDelRango(fechaInicio, fechaFin) {
  const pesadas = await sequelize.query(
    `SELECT
        v.id,
        v.fecha,
        v.estado,
        v.tipo_movimiento,
        v.empresa,
        v.material,
        v.personal_nombre,
        v.personal_apellido,
        v.patente,
        v.tipo_vehiculo,
        v.id_caja,
        v.tipo_caja,
        v.origen,
        v.nro_manifiesto,
        v.nro_remito,
        v.peso_bruto_kg,
        v.peso_declarado_kg,
        COALESCE(v.peso_neto_real_kg, v.peso_neto_estimado_kg) AS peso_neto_kg,
        v.dentro_tolerancia
     FROM vw_pesadas_con_neto v
     JOIN pesadas p ON p.id = v.id
     WHERE DATE(v.fecha) BETWEEN :fechaInicio AND :fechaFin
       AND v.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
       AND (p.eliminado = 0 OR p.eliminado IS NULL)
     ORDER BY peso_neto_kg DESC`,
    { replacements: { fechaInicio, fechaFin }, type: QueryTypes.SELECT }
  );

  const idsPesadas = pesadas.map((p) => p.id);

  let materialesDescarga = [];
  if (idsPesadas.length > 0) {
    materialesDescarga = await sequelize.query(
      `SELECT
          dd.pesada_id,
          dd.comentarios,
          tm.nombre AS tipo_material_descarga,
          mb.nombre AS material_base_descarga,
          fm.nombre AS forma_material_descarga,
          ddm.porcentaje
       FROM descarga_detalles dd
       JOIN descarga_detalles_materiales ddm
         ON ddm.id_descarga_detalles = dd.id_descarga_detalles
       JOIN materiales m
         ON m.id_materiales_descarga = ddm.id_materiales
       LEFT JOIN tipos_material   tm ON tm.id = m.tipo_material_id
       LEFT JOIN materiales_base  mb ON mb.id = m.material_base_id
       LEFT JOIN formas_material  fm ON fm.id = m.forma_material_id
       WHERE dd.pesada_id IN (:idsPesadas)`,
      { replacements: { idsPesadas }, type: QueryTypes.SELECT }
    );
  }

  const materialesPorPesada = new Map();
  for (const row of materialesDescarga) {
    if (!materialesPorPesada.has(row.pesada_id)) {
      materialesPorPesada.set(row.pesada_id, []);
    }
    materialesPorPesada.get(row.pesada_id).push(row);
  }

  for (const p of pesadas) {
    const items = materialesPorPesada.get(p.id) || [];
    p.materiales_descarga = items;
    p.comentarios = items[0]?.comentarios ?? null;
  }

  // Resumen por tipo de vehículo: cantidad de CAMIONES DISTINTOS
  // (patentes únicas), no cantidad de viajes.
  const resumenTiposCamion = new Map();

  for (const p of pesadas) {
    const tipo = p.tipo_vehiculo?.trim() || "SIN ESPECIFICAR";
    const peso = Number(p.peso_neto_kg) || 0;
    const patente = p.patente?.trim() || null;

    if (!resumenTiposCamion.has(tipo)) {
      resumenTiposCamion.set(tipo, {
        tipo_vehiculo: tipo,
        patentes: new Set(),
        kg_totales: 0,
      });
    }

    const resumen = resumenTiposCamion.get(tipo);
    if (patente) resumen.patentes.add(patente);
    resumen.kg_totales += peso;
  }

  const tiposCamion = Array.from(resumenTiposCamion.values())
    .map((r) => ({
      tipo_vehiculo: r.tipo_vehiculo,
      cantidad_camiones: r.patentes.size,
      kg_totales: r.kg_totales,
    }))
    .sort((a, b) => b.cantidad_camiones - a.cantidad_camiones);

  const cantidadPesadas = pesadas.length;
  const kgTotales = pesadas.reduce((total, p) => total + (Number(p.peso_neto_kg) || 0), 0);

  return {
    fechaInicio,
    fechaFin,
    cantidadPesadas,
    kgTotales,
    pesadas,
    tiposCamion,
  };
}