import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { materiales_generales } = models;


export const getMateriales = async (req, res) => {
  try {
    const data = await materiales_generales.findAll({
      order: [["nombre", "ASC"]]
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const createMaterial = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    const nuevo = await materiales_generales.create({ nombre });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};