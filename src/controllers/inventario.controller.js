import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { inventario_fisico } = models;

export const getInventario = async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT 
        m.id AS material_id,
        m.nombre,

        COALESCE(i.cantidad, 0) AS stock_fisico,
        i.fecha_actualizacion,

        COALESCE(s.stock_total, 0) AS stock_sistema,

        COALESCE(i.cantidad, 0) - COALESCE(s.stock_total, 0) AS diferencia

      FROM materiales m

      LEFT JOIN inventario_fisico i 
        ON i.material_id = m.id

      LEFT JOIN (
        SELECT material_id, SUM(peso_neto) AS stock_total
        FROM vw_pesadas_con_neto
        GROUP BY material_id
      ) s 
        ON s.material_id = m.id

      ORDER BY m.nombre
    `);

    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo inventario" });
  }
};


export const guardarInventario = async (req, res) => {
  try {
    const { material_id, cantidad, usuario_id } = req.body;

    const existente = await InventarioFisico.findOne({
      where: { material_id },
    });

    if (existente) {
      await existente.update({
        cantidad,
        usuario_id,
        fecha_actualizacion: new Date(),
      });
    } else {
      await InventarioFisico.create({
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