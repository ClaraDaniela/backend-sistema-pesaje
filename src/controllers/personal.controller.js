import { Personal, TipoPersonal } from "../models/index.js";

export const getPersonal = async (req, res) => {
  const personal = await Personal.findAll();
  res.json(personal);
};

export const createPersonal = async (req, res) => {
  const { nombre, apellido, tipo } = req.body;

  if (!nombre || !apellido || !tipo) {
    return res.status(400).json({
      error: "Nombre, apellido y tipo requeridos"
    });
  }

  try {
    const tipoPersonal = await TipoPersonal.findOne({
      where: { tipo }
    });

    if (!tipoPersonal) {
      return res.status(400).json({
        error: "Tipo de personal inválido"
      });
    }

    const persona = await Personal.create({
      nombre,
      apellido,
      id_tipo_personal: tipoPersonal.id_tipo_personal
    });

    res.status(201).json(persona);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChoferes = async (req, res) => {
  try {
    const choferes = await Personal.findAll({
      include: [{
        model: TipoPersonal,
        where: { tipo: "CHOFER" }
      }]
    });

    res.json(choferes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};