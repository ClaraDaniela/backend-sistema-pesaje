import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { handleControllerError } from "./utils/response.js";

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

    const nuevo = await materiales.create({
      tipo_material_id,
      estado_material_id,
      material_base_id,
      forma_material_id: forma_material_id || null
    });

    res.status(201).json(nuevo);
  } catch (error) {
    return handleControllerError(res, error, "Error al crear el material de descarga");
  }
};


export const getMaterialDescargaById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await materiales.findByPk(id, {
      include: [
        { model: tipos_material, as: "tipo_material" },
        { model: materiales_base, as: "material_base" },
        { model: formas_material, as: "forma_material" }
      ]
    });

    if (!data) {
      return res.status(404).json({ error: "No existe" });
    }

    res.json(data);
  } catch (error) {
    return handleControllerError(res, error, "Error al obtener el material de descarga");
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
    return handleControllerError(res, error, "Error al actualizar el material de descarga");
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
    return handleControllerError(res, error, "Error al eliminar el material de descarga");
  }
};

export const getTiposMaterial = async (req, res) => {
  try {
    const data = await tipos_material.findAll({
      attributes: ["id", "nombre"],
      order: [["nombre", "ASC"]],
    });
    res.json(data);
  } catch (error) {
    return handleControllerError(res, error, "Error al obtener los tipos de material");
  }
};

export const getCombinacionesMaterial = async (req, res) => {
  try {
    const data = await materiales.findAll({
      include: [
        { model: tipos_material, as: "tipo_material", attributes: ["id", "nombre"] },
        { model: materiales_base, as: "material_base", attributes: ["id", "nombre"] },
        { model: formas_material, as: "forma_material", attributes: ["id", "nombre"] },
      ],
      order: [
        [{ model: tipos_material, as: "tipo_material" }, "nombre", "ASC"],
        [{ model: materiales_base, as: "material_base" }, "nombre", "ASC"],
        [{ model: formas_material, as: "forma_material" }, "nombre", "ASC"],
      ],
    });

    // Aplanar para que el frontend reciba un objeto plano por fila
    const result = data.map(m => ({
      id_materiales_descarga: m.id_materiales_descarga,
      tipo_material_id: m.tipo_material?.id ?? null,
      tipo_nombre: m.tipo_material?.nombre ?? null,
      material_base_id: m.material_base?.id ?? null,
      base_nombre: m.material_base?.nombre ?? null,
      forma_material_id: m.forma_material?.id ?? null,
      forma_nombre: m.forma_material?.nombre ?? null,
    }));

    res.json(result);
  } catch (error) {
    return handleControllerError(res, error, "Error al obtener las combinaciones de material");
  }
};

export const getStockDetallado = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT
        m.id_materiales_descarga  AS material_id,
        tm.nombre                 AS categoria,
        COALESCE(mb.nombre, '')   AS material_base,
        COALESCE(fm.nombre, '')   AS forma,
        em.nombre                 AS estado,

        -- Ingresos: vienen de pesadas directamente por material_general_id
        COALESCE(ingresos.total, 0)
        -- Egresos: vienen de descarga_detalles con porcentaje por material
        - COALESCE(egresos.total, 0) AS stock_total

      FROM materiales m
      JOIN tipos_material   tm  ON tm.id = m.tipo_material_id
      JOIN estados_material em  ON em.id = m.estado_material_id
      LEFT JOIN materiales_base mb ON mb.id = m.material_base_id
      LEFT JOIN formas_material fm ON fm.id = m.forma_material_id

      -- Subquery ingresos: suma neto de todas las pesadas INGRESO
      -- agrupadas por material_general_id
      LEFT JOIN (
        SELECT
          p.material_general_id,
          SUM(
            p.peso_bruto_kg
            - (COALESCE(p.tara_real_kg, v.tara_kg) + COALESCE(c.tara_kg, 0))
          ) AS total
        FROM pesadas p
        JOIN vehiculos v ON v.id = p.vehiculo_id
        LEFT JOIN cajas c ON c.id = p.caja_id
        WHERE p.tipo_movimiento = 'INGRESO'
        GROUP BY p.material_general_id
      ) ingresos ON ingresos.material_general_id = m.material_base_id

      -- Subquery egresos: suma neto ponderada por porcentaje en descarga_detalles
      LEFT JOIN (
        SELECT
          ddm.id_materiales AS material_id,
          SUM(
            ((COALESCE(p.tara_real_kg, v.tara_kg) + COALESCE(c.tara_kg, 0)) 
            - p.peso_bruto_kg)
            * (ddm.porcentaje / 100)
          ) AS total
        FROM descarga_detalles_materiales ddm
        JOIN descarga_detalles dd ON dd.id_descarga_detalles = ddm.id_descarga_detalles
        JOIN pesadas   p ON p.id  = dd.pesada_id
        JOIN vehiculos v ON v.id  = p.vehiculo_id
        LEFT JOIN cajas c ON c.id = p.caja_id
        WHERE p.tipo_movimiento = 'EGRESO'
        GROUP BY ddm.id_materiales
      ) egresos ON egresos.material_id = m.id_materiales_descarga

      GROUP BY m.id_materiales_descarga, tm.nombre, mb.nombre, fm.nombre, em.nombre,
               ingresos.total, egresos.total
      ORDER BY tm.nombre, mb.nombre, fm.nombre`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(rows);
  } catch (error) {
    return handleControllerError(res, error, "Error al obtener el stock detallado");
  }
};

export const getInventarioDetallado = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT
        m.id_materiales_descarga  AS material_id,
        tm.nombre                 AS categoria,
        COALESCE(mb.nombre, '')   AS material_base,
        COALESCE(fm.nombre, '')   AS forma,
        em.nombre                 AS estado,

        COALESCE(SUM(
          CASE
            WHEN p.tipo_movimiento = 'INGRESO'
              THEN (p.peso_bruto_kg - (COALESCE(p.tara_real_kg, v.tara_kg) + COALESCE(c.tara_kg, 0)))
                   * (ddm.porcentaje / 100)
            WHEN p.tipo_movimiento = 'EGRESO'
              THEN (p.peso_bruto_kg - (COALESCE(p.tara_real_kg, v.tara_kg) + COALESCE(c.tara_kg, 0)))
                   * (ddm.porcentaje / 100)
          END
        ), 0)                    AS stock_sistema,

        inv.cantidad              AS stock_fisico,
        inv.fecha_actualizacion   AS fecha_actualizacion

      FROM materiales m
      JOIN tipos_material    tm  ON tm.id  = m.tipo_material_id
      JOIN estados_material  em  ON em.id  = m.estado_material_id
      LEFT JOIN materiales_base  mb  ON mb.id  = m.material_base_id
      LEFT JOIN formas_material  fm  ON fm.id  = m.forma_material_id
      LEFT JOIN descarga_detalles_materiales ddm ON ddm.id_materiales        = m.id_materiales_descarga
      LEFT JOIN descarga_detalles            dd  ON dd.id_descarga_detalles  = ddm.id_descarga_detalles
      LEFT JOIN pesadas   p ON p.id  = dd.pesada_id
      LEFT JOIN vehiculos v ON v.id  = p.vehiculo_id
      LEFT JOIN cajas     c ON c.id  = p.caja_id
      LEFT JOIN inventario_fisico inv ON inv.material_id = m.id_materiales_descarga

      GROUP BY m.id_materiales_descarga, tm.nombre, mb.nombre, fm.nombre, em.nombre,
               inv.cantidad, inv.fecha_actualizacion
      ORDER BY tm.nombre, mb.nombre, fm.nombre`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(rows);
  } catch (error) {
    return handleControllerError(res, error, "Error al obtener el inventario detallado");
  }
};

export const upsertInventario = async (req, res) => {
  try {
    const { material_id, cantidad, usuario_id } = req.body;

    if (material_id == null || cantidad == null) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    await sequelize.query(
      `INSERT INTO inventario_fisico (material_id, cantidad, usuario_id)
       VALUES (:material_id, :cantidad, :usuario_id)
       ON DUPLICATE KEY UPDATE
         cantidad           = :cantidad,
         usuario_id         = :usuario_id,
         fecha_actualizacion = NOW()`,
      {
        replacements: { material_id, cantidad, usuario_id: usuario_id ?? null },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.json({ ok: true });
  } catch (error) {
    return handleControllerError(res, error, "Error al actualizar el inventario");
  }
};