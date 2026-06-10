import { sequelize } from "../config/db.js";

export const getStockMaterialesGenerales = async (req, res) => {
    try {

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

      LEFT JOIN vehiculos v
          ON v.id = p.vehiculo_id

      LEFT JOIN cajas c
          ON c.id = p.caja_id

      GROUP BY
          mg.id,
          mg.nombre

      ORDER BY
          mg.nombre ASC
      `,
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.json(rows);

    } catch (error) {

        console.error(
            "ERROR STOCK GENERALES:",
            error
        );

        res.status(500).json({
            error: error.message,
        });

    }
};


export const getStockMaterialesDescarga = async (req, res) => {
    try {
        const rows = await sequelize.query(
            `
      SELECT
          m.id_materiales_descarga     AS material_id,

          tm.nombre                    AS categoria,
          COALESCE(mb.nombre, '')      AS material_base,
          COALESCE(fm.nombre, '')      AS forma,
          em.nombre                    AS estado,

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
                      ) * (ddm.porcentaje / 100)
                  WHEN p.tipo_movimiento = 'EGRESO'
                      THEN -(
                          p.peso_bruto_kg -
                          CASE
                              WHEN p.tara_real_kg IS NOT NULL
                                  THEN p.tara_real_kg
                              ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                          END
                      ) * (ddm.porcentaje / 100)
                  ELSE 0
              END
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

      ORDER BY
          tm.nombre ASC,
          mb.nombre ASC,
          fm.nombre ASC
      `,
            {
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.json(rows);

    } catch (error) {
        console.error("ERROR STOCK DESCARGA:", error);

        res.status(500).json({
            error: error.message,
        });
    }
};