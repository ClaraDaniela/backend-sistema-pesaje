import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

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
    return handleControllerError(res, err, "Error guardando inventario");
  }
};

export const getInventario = async (req, res) => {
  try {
    const data = await sequelize.query(
      `
      WITH stock_calculado AS (
          SELECT
              p.material_general_id,
              SUM(
                  CASE 
                      WHEN p.tipo_movimiento = 'INGRESO' 
                          THEN ABS(p.peso_bruto_kg - COALESCE(p.tara_real_kg, v.tara_kg + COALESCE(c.tara_kg, 0)))
                      WHEN p.tipo_movimiento = 'EGRESO' 
                          THEN -ABS(p.peso_bruto_kg - COALESCE(p.tara_real_kg, v.tara_kg + COALESCE(c.tara_kg, 0)))
                      ELSE 0 
                  END
              ) AS total_sistema
          FROM pesadas p
          JOIN vehiculos v ON v.id = p.vehiculo_id
          LEFT JOIN cajas c ON c.id = p.caja_id
          WHERE p.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
          GROUP BY p.material_general_id
      ),
      inventario_agregado AS (
          SELECT mb.nombre, SUM(inf.cantidad) as cantidad, MAX(inf.fecha_actualizacion) as fecha_actualizacion, MAX(inf.usuario_id) as usuario_id
          FROM inventario_fisico inf
          JOIN materiales m ON m.id_materiales_descarga = inf.material_id
          JOIN materiales_base mb ON mb.id = m.material_base_id
          GROUP BY mb.nombre
      )
      SELECT
          mg.id AS material_id,
          mg.nombre AS material,
          COALESCE(sc.total_sistema, 0) AS stock_sistema,
          inv.cantidad AS stock_fisico,
          inv.fecha_actualizacion,
          u.nombreusuario AS usuario
      FROM materiales_generales mg
      LEFT JOIN stock_calculado sc ON sc.material_general_id = mg.id
      LEFT JOIN inventario_agregado inv ON UPPER(TRIM(inv.nombre)) = UPPER(TRIM(mg.nombre))
      LEFT JOIN usuarios u ON u.id = inv.usuario_id
      ORDER BY mg.nombre
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(data);

  } catch (error) {
    return handleControllerError(res, error, "Error al obtener el inventario");
  }
};