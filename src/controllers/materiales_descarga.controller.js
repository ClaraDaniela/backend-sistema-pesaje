import { MaterialDescarga } from "../models/index.js";

export const getMaterialesDescarga = async (req, res) => {
  try {
    const materiales = await MaterialDescarga.findAll({
      order: [["nombre", "ASC"]]
    });

    res.json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};