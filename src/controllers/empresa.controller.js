import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { empresas } = models;

export const getEmpresas = async (req, res) => {
  const data = await empresas.findAll();
  res.json(data);
};

export const createEmpresa = async (req, res) => {
  const { nombre, cuit } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const empresa = await empresas.create({ nombre, cuit });
  res.status(201).json(empresa);
};
