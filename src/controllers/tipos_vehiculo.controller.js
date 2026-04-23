import { TipoVehiculo } from "../models/index.js";

export const getTiposVehiculo = async (req, res) => {
  const tiposVehiculo = await TipoVehiculo.findAll();
  res.json(tiposVehiculo);
};

export const createTiposVehiculo = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const tipoVehiculo = await TipoVehiculo.create({
    nombre,
  });

  res.status(201).json(tipoVehiculo);
};
