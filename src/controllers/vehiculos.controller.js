import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { vehiculos } = models;

export const createVehiculo = async (req, res) => {
  try {
    const { patente, descripcion, tara_kg, tipo_vehiculo_id } = req.body;

    if (!patente || tara_kg == null || !tipo_vehiculo_id) {
      return res.status(400).json({
        error: "Patente, tara y tipo de vehículo son obligatorios",
      });
    }

    const vehiculo = await vehiculos.create({
      patente,
      descripcion,
      tara_kg,
      tipo_vehiculo_id: Number(tipo_vehiculo_id),
    });

    res.status(201).json(vehiculo);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "La patente ya existe" });
    }

    res.status(500).json({ error: "Error al crear vehículo" });
  }
};

export const getVehiculosByTipo = async (req, res) => {
  try {
    const { tipo_vehiculo_id } = req.query;

    const where = {};

    if (tipo_vehiculo_id) {
      where.tipo_vehiculo_id = Number(tipo_vehiculo_id);
    }

    const data = await vehiculos.findAll({
      where,
      order: [["patente", "ASC"]],
    });

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
};