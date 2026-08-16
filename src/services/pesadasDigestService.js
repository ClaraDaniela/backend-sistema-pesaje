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

  // Detalle de cada pesada del día (sin las borradas)
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

  return {
    fecha: fecha || new Date().toISOString().slice(0, 10),
    cantidadPesadas: pesadas.length,
    totalGeneralKg,
    pesadas,
  };
}