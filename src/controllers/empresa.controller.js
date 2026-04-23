import { Empresa } from "../models/index.js";

export const getEmpresas = async (req, res) => {
  const empresas = await Empresa.findAll();
  res.json(empresas);
};

export const createEmpresa = async (req, res) => {
  const { nombre, cuit } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const empresa = await Empresa.create({ nombre, cuit });
  res.status(201).json(empresa);
};
