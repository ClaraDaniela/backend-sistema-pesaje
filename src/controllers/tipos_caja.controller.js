import { TipoCaja } from "../models/index.js";

export const getTiposCaja = async (req, res) => {
  const tiposCaja = await TipoCaja.findAll();
  res.json(tiposCaja);
};

export const createTiposCaja = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoCaja = await TipoCaja.create({
    nombre,
  });

  res.status(201).json(tipoCaja);
};
