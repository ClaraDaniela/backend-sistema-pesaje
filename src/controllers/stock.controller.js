import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

/**
 * Arma la cláusula WHERE dinámica según los filtros recibidos por query params.
 * clienteId en realidad filtra por empresa_id (no hay tabla "clientes" separada).
 */
const buildFiltrosStock = (query, { alias = "p", materialAlias = "mg", materialColumn = "id" }) => {
    const condiciones = [];
    const replacements = {};

    const { fechaDesde, fechaHasta, clienteId, materialId } = query;

    if (fechaDesde) {
        condiciones.push(`${alias}.fecha >= :fechaDesde`);
        replacements.fechaDesde = fechaDesde;
    }

    if (fechaHasta) {
        // Sumamos el día completo para que "hasta" sea inclusivo
        condiciones.push(`${alias}.fecha < DATE_ADD(:fechaHasta, INTERVAL 1 DAY)`);
        replacements.fechaHasta = fechaHasta;
    }

    if (clienteId) {
        condiciones.push(`${alias}.empresa_id = :clienteId`);
        replacements.clienteId = clienteId;
    }

    if (materialId) {
        condiciones.push(`${materialAlias}.${materialColumn} = :materialId`);
        replacements.materialId = materialId;
    }

    const whereSql = condiciones.length
        ? `AND ${condiciones.join(" AND ")}`
        : "";

    return { whereSql, replacements };
};

export const getStockMaterialesGenerales = async (req, res) => {
    try {

        const { whereSql, replacements } = buildFiltrosStock(req.query, {
            alias: "p",
            materialAlias: "mg",
            materialColumn: "id",
        });

        const rows = await sequelize.query(
            `
        SELECT
            mg.id AS material_id,
            mg.nombre AS material,

            COALESCE(SUM(
                CASE
                    WHEN p.tipo_movimiento = 'INGRESO'
                        THEN (
                            p.peso_bruto_kg -
                            CASE
                                WHEN p.tara_real_kg IS NOT NULL
                                    THEN p.tara_real_kg
                                ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                            END
                        )
                    WHEN p.tipo_movimiento = 'EGRESO'
                        THEN -(
                            p.peso_bruto_kg -
                            CASE
                                WHEN p.tara_real_kg IS NOT NULL
                                    THEN p.tara_real_kg
                                ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                            END
                        )
                    ELSE 0
                END
            ), 0) AS stock_total

        FROM materiales_generales mg

        LEFT JOIN pesadas p
            ON p.material_general_id = mg.id
            AND p.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
            AND p.eliminado = 0
            ${whereSql}

        LEFT JOIN vehiculos v
            ON v.id = p.vehiculo_id

        LEFT JOIN cajas c
            ON c.id = p.caja_id

        GROUP BY
            mg.id,
            mg.nombre

        HAVING stock_total <> 0

        ORDER BY
            mg.nombre ASC
      `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements,
            }
        );

        res.json(rows);

    } catch (error) {
        return handleControllerError(res, error, "Error al obtener el stock general");
    }
};


export const getStockMaterialesDescarga = async (req, res) => {
    try {
        const { whereSql, replacements } = buildFiltrosStock(req.query, {
            alias: "p",
            materialAlias: "m",
            materialColumn: "id_materiales_descarga",
        });

        const rows = await sequelize.query(
            `
      SELECT
          m.id_materiales_descarga     AS material_id,

          tm.nombre                    AS categoria,
          COALESCE(mb.nombre, '')      AS material_base,
          COALESCE(fm.nombre, '')      AS forma,
          em.nombre                    AS estado,

                COALESCE(SUM(
                    (
                        p.peso_bruto_kg -
                        CASE
                            WHEN p.tara_real_kg IS NOT NULL
                                THEN p.tara_real_kg
                            ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                        END
                    ) * (ddm.porcentaje / 100)
                ), 0) AS stock_total

      FROM materiales m

      JOIN tipos_material tm
          ON tm.id = m.tipo_material_id

      JOIN estados_material em
          ON em.id = m.estado_material_id

      LEFT JOIN materiales_base mb
          ON mb.id = m.material_base_id

      LEFT JOIN formas_material fm
          ON fm.id = m.forma_material_id

      LEFT JOIN descarga_detalles_materiales ddm
          ON ddm.id_materiales = m.id_materiales_descarga

      LEFT JOIN descarga_detalles dd
          ON dd.id_descarga_detalles = ddm.id_descarga_detalles

      LEFT JOIN pesadas p
          ON p.id = dd.pesada_id
          AND p.eliminado = 0
          ${whereSql}

      LEFT JOIN vehiculos v
          ON v.id = p.vehiculo_id

      LEFT JOIN cajas c
          ON c.id = p.caja_id

      GROUP BY
          m.id_materiales_descarga,
          tm.nombre,
          mb.nombre,
          fm.nombre,
          em.nombre

    HAVING stock_total <> 0

      ORDER BY
          tm.nombre ASC,
          mb.nombre ASC,
          fm.nombre ASC
      `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements,
            }
        );

        res.json(rows);

    } catch (error) {
        return handleControllerError(res, error, "Error al obtener el stock por descarga");
    }
};

export const getTotalesKpi = async (req, res) => {
    try {

        const { whereSql, replacements } = buildFiltrosStock(req.query, {
            alias: "p",
            materialAlias: "p",
            materialColumn: "material_general_id",
        });

        const [result] = await sequelize.query(
            `
      SELECT
          COALESCE(SUM(CASE WHEN p.tipo_movimiento = 'INGRESO' THEN 
              GREATEST(p.peso_bruto_kg - 
                  CASE 
                      WHEN p.tara_real_kg IS NOT NULL THEN p.tara_real_kg 
                      ELSE v.tara_kg + COALESCE(c.tara_kg, 0) 
                  END, 0)
          ELSE 0 END), 0) AS total_ingreso,
          
          COALESCE(SUM(CASE WHEN p.tipo_movimiento = 'EGRESO' THEN 
              GREATEST(p.peso_bruto_kg - 
                  CASE 
                      WHEN p.tara_real_kg IS NOT NULL THEN p.tara_real_kg 
                      ELSE v.tara_kg + COALESCE(c.tara_kg, 0) 
                  END, 0)
          ELSE 0 END), 0) AS total_egreso
      FROM pesadas p
      JOIN vehiculos v ON v.id = p.vehiculo_id
      LEFT JOIN cajas c ON c.id = p.caja_id
      WHERE p.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
      AND p.eliminado = 0
      ${whereSql}
      `,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements,
            }
        );

        res.json(result);

    } catch (error) {
        return handleControllerError(res, error, "Error al obtener totales para KPI");
    }
};