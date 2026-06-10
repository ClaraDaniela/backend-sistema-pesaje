import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { inventario_fisico } = models;


export const guardarInventario = async (req, res) => {
  try {
    const { material_id, cantidad, usuario_id } = req.body;

    const existente = await inventario_fisico.findOne({
      where: { material_id },
    });

    if (existente) {
      await existente.update({
        cantidad,
        usuario_id,
        fecha_actualizacion: new Date(),
      });
    } else {
      await inventario_fisico.create({
        material_id,
        cantidad,
        usuario_id,
        fecha_actualizacion: new Date(),
      });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando inventario" });
  }
};

export const getInventario = async (req, res) => {
  try {
    const data = await sequelize.query(
      `
      SELECT
          mg.id AS material_id,
          mg.nombre AS material,

          COALESCE(
              SUM(
                  CASE
                      WHEN p.tipo_movimiento = 'INGRESO'
                          THEN GREATEST(
                              p.peso_bruto_kg -
                              CASE
                                  WHEN p.tara_real_kg IS NOT NULL THEN p.tara_real_kg
                                  ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                              END,
                              0
                          )
                      WHEN p.tipo_movimiento = 'EGRESO'
                          THEN -GREATEST(
                              p.peso_bruto_kg -
                              CASE
                                  WHEN p.tara_real_kg IS NOT NULL THEN p.tara_real_kg
                                  ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                              END,
                              0
                          )
                      ELSE 0
                  END
              ),
              0
          ) AS stock_sistema,

          inv.cantidad AS stock_fisico,
          inv.fecha_actualizacion,
          u.nombreusuario AS usuario

      FROM materiales_generales mg

      LEFT JOIN pesadas p
          ON p.material_general_id = mg.id
          AND p.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')

      LEFT JOIN vehiculos v ON v.id = p.vehiculo_id
      LEFT JOIN cajas c ON c.id = p.caja_id
      LEFT JOIN inventario_fisico inv ON inv.material_id = mg.id
      LEFT JOIN usuarios u ON u.id = inv.usuario_id

      GROUP BY
          mg.id,
          mg.nombre,
          inv.cantidad,
          inv.fecha_actualizacion,
          u.nombreusuario

      ORDER BY mg.nombre
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};