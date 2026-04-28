import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { tipos_vehiculo } = models;

export const getTiposVehiculo = async (req, res) => {
  const tiposVehiculo = await tipos_vehiculo.findAll();
  res.json(tiposVehiculo);
};

export const createTiposVehiculo = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoVehiculo = await tipos_vehiculo.create({
    nombre,
  });

  res.status(201).json(tipoVehiculo);
};
