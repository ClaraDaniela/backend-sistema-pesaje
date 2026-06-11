import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

const models = initModels(sequelize);
const { materiales_generales } = models;


export const getMateriales = async (req, res) => {
  try {

    const data = await materiales_generales.findAll({
      attributes: ["id", "nombre"],
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

    const nombreNormalizado = nombre.trim().toUpperCase();

    const nuevo = await materiales_generales.create({ nombre: nombreNormalizado });

    res.status(201).json({
      id: nuevo.id,
      nombre: nuevo.nombre
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};