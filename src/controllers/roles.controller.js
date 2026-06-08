import { Op } from "sequelize";
import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);

const { roles } = models;

export const getRoles = async (req, res) => {
  try {

    const { nombre } = req.query;

    const where = {};

    if (nombre?.trim()) {
      where.nombre = {
        [Op.like]: `%${nombre.trim()}%`,
      };
    }

    const data = await roles.findAll({
      attributes: ["id", "nombre"],
      where,
      order: [["nombre", "ASC"]],
    });

    return res.json(data);

  } catch (err) {

    console.error("Error al obtener roles:", err);

    return res.status(500).json({
      error: "Error interno al obtener roles",
    });

  }
};