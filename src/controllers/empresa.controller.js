import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

const models = initModels(sequelize);
const { empresas } = models;

export const getEmpresas = async (req, res) => {
  const data = await empresas.findAll();
  res.json(data);
};

export const createEmpresa = async (req, res) => {
  try {
    const { nombre, cuit } = req.body;

    const nombreNormalizado = nombre.trim().toUpperCase();

    const empresa = await empresas.create({
      nombre: nombreNormalizado,
      cuit,
    });

    res.status(201).json(empresa);

  } catch (err) {
    return handleControllerError(res, err, "Error al crear la empresa");
  }
};