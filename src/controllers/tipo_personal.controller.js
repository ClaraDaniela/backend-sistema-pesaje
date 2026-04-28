import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { tipo_personal } = models;

export const getTiposPersonal = async (req, res) => {
  const tiposPersonal = await tipo_personal.findAll();
  res.json(tiposPersonal);
};

export const createTiposPersonal = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoPersonal = await tipo_personal.create({
    nombre,
  });

  res.status(201).json(tipoPersonal);
};
