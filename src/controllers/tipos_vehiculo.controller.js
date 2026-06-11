import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

const models = initModels(sequelize);
const { tipos_vehiculo } = models;

export const getTiposVehiculo = async (req, res) => {
  const tiposVehiculo = await tipos_vehiculo.findAll();
  res.json(tiposVehiculo);
};

export const createTiposVehiculo = async (req, res) => {
  try {
    const { nombre } = req.body;

    const tipoVehiculo = await tipos_vehiculo.create({
      nombre,
    });

    return res.status(201).json(tipoVehiculo);
  } catch (error) {
    return handleControllerError(res, error, "Error al crear el tipo de vehículo");
  }
};
