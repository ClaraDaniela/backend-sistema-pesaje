import { Material } from "../models/index.js";

export const getMateriales = async (req, res) => {
  const materiales = await Material.findAll();
  res.json(materiales);
};

export const createMaterial = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const material = await Material.create({ nombre });
  res.status(201).json(material);
};
