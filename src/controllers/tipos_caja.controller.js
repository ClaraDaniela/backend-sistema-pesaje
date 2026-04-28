import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { tipos_caja } = models;

export const getTiposCaja = async (req, res) => {
  const tiposCaja = await tipos_caja.findAll();
  res.json(tiposCaja);
};

export const createTiposCaja = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoCaja = await tipos_caja.create({
    nombre,
  });

  res.status(201).json(tipoCaja);
};
