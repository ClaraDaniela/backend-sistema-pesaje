import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

const models = initModels(sequelize);
const { materiales_generales } = models;


export const getMateriales = async (req, res) => {
  try {
    const { tipo_movimiento } = req.query;

    const where = {};
    if (tipo_movimiento === "INGRESO") where.aplica_ingreso = 1;
    else if (tipo_movimiento === "EGRESO") where.aplica_egreso = 1;

    const data = await materiales_generales.findAll({
      attributes: ["id", "nombre", "descripcion", "aplica_ingreso", "aplica_egreso"],
      where,
      order: [["nombre", "ASC"]]
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


