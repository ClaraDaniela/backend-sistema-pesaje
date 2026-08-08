import { sequelize } from "../config/db.js";
import { QueryTypes } from "sequelize";

/**
 * Obtiene el digest de pesadas de un día determinado (por defecto, hoy).
 * Usa la vista vw_pesadas_con_neto, que ya trae el peso neto calculado
 * (real si se pesó vacío, o estimado por tara teórica si no).
 *
 * @param {string|null} fecha - Fecha en formato 'YYYY-MM-DD'. Si es null, usa CURDATE().
 */
export async function obtenerDigestDelDia(fecha = null) {
  const condicionFecha = fecha ? "DATE(fecha) = :fecha" : "DATE(fecha) = CURDATE()";
  const replacements = fecha ? { fecha } : {};

  // Detalle de cada pesada del día
  const pesadas = await sequelize.query(
    `SELECT
        id,
        fecha,
        estado,
        tipo_movimiento,
        empresa,
        material,
        personal_nombre,
        personal_apellido,
        patente,
        tipo_vehiculo,
        id_caja,
        tipo_caja,
        origen,
        nro_manifiesto,
        nro_remito,
        peso_bruto_kg,
        peso_declarado_kg,
        COALESCE(peso_neto_real_kg, peso_neto_estimado_kg) AS peso_neto_kg,
        dentro_tolerancia
     FROM vw_pesadas_con_neto
     WHERE ${condicionFecha}
       AND estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
     ORDER BY fecha ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  // Totales agrupados por material
  const totalesPorMaterial = await sequelize.query(
    `SELECT
        material,
        COUNT(*) AS cantidad_pesadas,
        SUM(COALESCE(peso_neto_real_kg, peso_neto_estimado_kg)) AS total_kg
     FROM vw_pesadas_con_neto
     WHERE ${condicionFecha}
       AND estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
     GROUP BY material
     ORDER BY total_kg DESC`,
    { replacements, type: QueryTypes.SELECT }
  );

  const totalGeneralKg = totalesPorMaterial.reduce(
    (acc, row) => acc + Number(row.total_kg || 0),
    0
  );

  return {
    fecha: fecha || new Date().toISOString().slice(0, 10),
    cantidadPesadas: pesadas.length,
    totalGeneralKg,
    totalesPorMaterial,
    pesadas,
  };
}