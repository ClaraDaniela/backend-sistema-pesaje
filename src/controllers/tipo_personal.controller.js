import { TipoPersonla } from "../models/index.js";

export const getTiposPersonal = async (req, res) => {
  const tiposPersonal = await TipoPersonal.findAll();
  res.json(tiposPersonal);
};

export const createTiposPersonal = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoPersonal = await TipoPersonal.create({
    nombre,
  });

  res.status(201).json(tipoPersonal);
};
