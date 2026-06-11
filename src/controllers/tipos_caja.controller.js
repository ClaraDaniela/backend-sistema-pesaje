import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

const models = initModels(sequelize);
const { tipos_caja } = models;

export const getTiposCaja = async (req, res) => {
  const tiposCaja = await tipos_caja.findAll();
  res.json(tiposCaja);
};

export const createTiposCaja = async (req, res) => {
  try {
    const { nombre } = req.body;

    const tipoCaja = await tipos_caja.create({
      nombre,
    });

    return res.status(201).json(tipoCaja);
  } catch (error) {
    return handleControllerError(res, error, "Error al crear el tipo de caja");
  }
};
