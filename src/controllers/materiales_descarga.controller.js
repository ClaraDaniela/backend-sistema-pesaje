import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);

const {
  materiales,
  tipos_material,
  estados_material,
  materiales_base,
  formas_material
} = models;


export const getMaterialesDescarga = async (req, res) => {
  try {
    const data = await materiales.findAll({
      include: [
        { model: tipos_material, as: "tipo_material", attributes: ["id", "nombre"] },
        { model: estados_material, as: "estado_material", attributes: ["id", "nombre"] },
        { model: materiales_base, as: "material_base", attributes: ["id", "nombre"] },
        { model: formas_material, as: "forma_material", attributes: ["id", "nombre"] }
      ],
      order: [["id_materiales_descarga", "ASC"]]
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const createMaterialDescarga = async (req, res) => {
  try {
    const {
      tipo_material_id,
      estado_material_id,
      material_base_id,
      forma_material_id
    } = req.body;

    if (!tipo_material_id || !estado_material_id || !material_base_id) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const nuevo = await materiales.create({
      tipo_material_id,
      estado_material_id,
      material_base_id,
      forma_material_id: forma_material_id || null
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMaterialDescargaById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await materiales.findByPk(id, {
      include: [
        { model: tipos_material, as: "tipo_material" },
        { model: estados_material, as: "estado_material" },
        { model: materiales_base, as: "material_base" },
        { model: formas_material, as: "forma_material" }
      ]
    });

    if (!data) {
      return res.status(404).json({ error: "No existe" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateMaterialDescarga = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await materiales.findByPk(id);

    if (!material) {
      return res.status(404).json({ error: "No existe" });
    }

    await material.update(req.body);

    res.json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteMaterialDescarga = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await materiales.findByPk(id);

    if (!material) {
      return res.status(404).json({ error: "No existe" });
    }

    await material.destroy();

    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/materiales_descarga/tipos
export const getTiposMaterial = async (req, res) => {
  try {
    const data = await tipos_material.findAll({
      attributes: ["id", "nombre"],
      order: [["nombre", "ASC"]],
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/materiales_descarga/combinaciones
export const getCombinacionesMaterial = async (req, res) => {
  try {
    const data = await materiales.findAll({
      include: [
        { model: tipos_material,   as: "tipo_material",   attributes: ["id", "nombre"] },
        { model: estados_material, as: "estado_material", attributes: ["id", "nombre"] },
        { model: materiales_base,  as: "material_base",   attributes: ["id", "nombre"] },
        { model: formas_material,  as: "forma_material",  attributes: ["id", "nombre"] },
      ],
      order: [
        [{ model: tipos_material,  as: "tipo_material"  }, "nombre", "ASC"],
        [{ model: materiales_base, as: "material_base"  }, "nombre", "ASC"],
        [{ model: formas_material, as: "forma_material" }, "nombre", "ASC"],
      ],
    });

    // Aplanar para que el frontend reciba un objeto plano por fila
    const result = data.map(m => ({
      id_materiales_descarga: m.id_materiales_descarga,
      tipo_material_id:       m.tipo_material?.id   ?? null,
      tipo_nombre:            m.tipo_material?.nombre ?? null,
      estado_material_id:     m.estado_material?.id  ?? null,
      estado_nombre:          m.estado_material?.nombre ?? null,
      material_base_id:       m.material_base?.id   ?? null,
      base_nombre:            m.material_base?.nombre ?? null,
      forma_material_id:      m.forma_material?.id  ?? null,
      forma_nombre:           m.forma_material?.nombre ?? null,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};