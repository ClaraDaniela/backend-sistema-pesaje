import { Caja } from "../models/index.js";

export const getCajas = async (req, res) => {
  try {
    const { tipo_caja_id } = req.query;

    const where = { activo: true };

    if (tipo_caja_id) {
      where.tipo_caja_id = Number(tipo_caja_id);
    }

    const cajas = await Caja.findAll({
      where,
      order: [["codigo", "ASC"]],
    });

    res.json(cajas);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener cajas" });
  }
};

export const createCaja = async (req, res) => {
  const { tipo, descripcion, tara_kg } = req.body;

  if (!tipo || tara_kg == null) {
    return res.status(400).json({ error: "Tipo y tara requeridos" });
  }

  const caja = await Caja.create({ tipo, descripcion, tara_kg });
  res.status(201).json(caja);
};

export const getCajasByTipo = async (req, res) => {
  const { tipo } = req.params;

  const cajas = await Caja.findAll({
    where: { tipo },
  });

  res.json(cajas);

}