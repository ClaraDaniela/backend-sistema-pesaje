import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { empresas } = models;

export const getEmpresas = async (req, res) => {
  const data = await empresas.findAll();
  res.json(data);
};

export const createEmpresa = async (req, res) => {
  try {
    const { nombre, cuit } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    const nombreNormalizado = nombre.trim().toUpperCase();

    const nuevo = await materiales_generales.create({ nombre: nombreNormalizado });

    const empresa = await empresas.create({
      nombre: nombreNormalizado,
      cuit,
    });

    res.status(201).json(empresa);

  } catch (err) {

    res.status(500).json({
      error: err?.parent?.sqlMessage || err.message,
    });
  }
};