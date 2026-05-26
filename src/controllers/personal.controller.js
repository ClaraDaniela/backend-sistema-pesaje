import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { personal, tipo_personal } = models;

export const getPersonal = async (req, res) => {
  const data = await personal.findAll({
    attributes: [
      ["id_personal", "id"],
      "nombre",
      "apellido",
      "activo"
    ]
  });
  res.json(data);
};

export const createPersonal = async (req, res) => {
  const { nombre, apellido, tipo } = req.body;

  if (!nombre || !apellido || !tipo) {
    return res.status(400).json({
      error: "Nombre, apellido y tipo requeridos"
    });
  }

  try {
    const tipoPersonal = await tipo_personal.findOne({
      where: { tipo }
    });

    if (!tipoPersonal) {
      return res.status(400).json({
        error: "Tipo de personal inválido"
      });
    }

    const persona = await personal.create({
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
    const choferes = await personal.findAll({
      attributes: [
        ["id_personal", "id"],
        "nombre",
        "apellido",
        "activo"
      ],
      include: [{
        model: tipo_personal,
        as: "id_tipo_personal_tipo_personal",
        where: { tipo: "CHOFER" }
      }]
    });

    res.json(choferes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};