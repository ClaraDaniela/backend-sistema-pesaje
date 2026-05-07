import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { cajas } = models;

export const getCajas = async (req, res) => {
  try {
    const { tipo_caja_id } = req.query;

    const where = { activo: true };

    if (tipo_caja_id) {
      where.tipo_caja_id = Number(tipo_caja_id);
    }

    const data = await cajas.findAll({
      where,
      order: [["codigo", "ASC"]],
    });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener cajas" });
  }
};

export const createCaja = async (req, res) => {
  try {
    const {
      tipo_caja_id,
      codigo,
      tara_kg,
      patente
    } = req.body;

    if (!tipo_caja_id) {
      return res.status(400).json({
        error: "Tipo de caja requerido"
      });
    }

    if (!codigo?.trim()) {
      return res.status(400).json({
        error: "Código requerido"
      });
    }

    if (tara_kg == null || isNaN(tara_kg)) {
      return res.status(400).json({
        error: "Tara requerida"
      });
    }

    const caja = await cajas.create({
      tipo_caja_id: Number(tipo_caja_id),
      codigo: codigo.trim(),
      tara_kg: Number(tara_kg),
      patente: patente || null,
      activo: true
    });

    res.status(201).json(caja);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

export const getCajasByTipo = async (req, res) => {
  const { tipo_caja_id } = req.params;

  const cajas = await cajas.findAll({
    where: { tipo_caja_id: Number(tipo_caja_id) },
  });

  res.json(cajas);

}