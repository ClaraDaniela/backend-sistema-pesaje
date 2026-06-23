import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);

const {
  descarga_detalles: DescargaDetalle,
  descarga_detalles_materiales: MaterialDescarga,
  pesadas: Pesada
} = models;

export const createDescarga = async (req, res) => {
  const { pesada_id, responsable, comentarios, materiales } = req.body;

  const t = await sequelize.transaction();

  try {
    const total = materiales.reduce(
      (acc, m) => acc + Number(m.porcentaje || 0),
      0
    );

    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({
        error: "Los porcentajes deben sumar 100%"
      });
    }

    const ids = materiales.map(m => m.material_id);

    if (ids.length !== new Set(ids).size) {
      return res.status(400).json({
        error: "Materiales duplicados"
      });
    }

    const pesada = await Pesada.findByPk(pesada_id);
    if (!pesada) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    if (pesada.estado === "DESCARGADO") {
      return res.status(400).json({
        error: "La pesada ya fue descargada"
      });
    }

    const descarga = await DescargaDetalle.create({
      pesada_id,
      responsable,
      comentarios
    }, { transaction: t });

    for (const mat of materiales) {
      const kg = (Number(pesada.peso_neto) * Number(mat.porcentaje)) / 100;


      await MaterialDescarga.create({
        id_descarga_detalles: descarga.id_descarga_detalles,
        id_materiales: mat.material_id,
        porcentaje: mat.porcentaje
      }, { transaction: t });
    }

    await t.commit();

    res.json({ message: "Descarga guardada" });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
export const getDescargaPorPesada = async (req, res) => {
  const { pesadaId } = req.params;

  try {
    const descarga = await DescargaDetalle.findOne({
      where: { pesada_id: pesadaId },
      include: {
        model: MaterialDescarga,
        through: {
          attributes: ["porcentaje"]
        }
      }
    });

    res.json(descarga);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReciclabilidad = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
      SELECT
          dd.id_descarga_detalles,
          dd.marca_temporal_info AS fecha_descarga,
          dd.comentarios,
          p.id AS pesada_id,
          p.nro_manifiesto,
          p.nro_remito,
          e.nombre AS empresa,
          per.nombre AS personal_nombre,
          per.apellido AS personal_apellido,
          veh.patente,
          mg.nombre AS material_general_pesada,
          (p.peso_bruto_kg - COALESCE(p.tara_real_kg, veh.tara_kg + COALESCE(c.tara_kg, 0))) AS peso_neto_pesada,
          ddm.porcentaje,
          md.id_materiales_descarga AS material_descarga_id,
          tm.nombre AS tipo_material_descarga,
          mb.nombre AS material_base_descarga,
          fm.nombre AS forma_material_descarga,
          em.nombre AS estado_material_descarga
      FROM descarga_detalles dd
      JOIN pesadas p ON p.id = dd.pesada_id
      JOIN empresas e ON e.id = p.empresa_id
      JOIN personal per ON per.id_personal = p.personal_id
      JOIN vehiculos veh ON veh.id = p.vehiculo_id
      LEFT JOIN cajas c ON c.id = p.caja_id
      JOIN materiales_generales mg ON mg.id = p.material_general_id
      JOIN descarga_detalles_materiales ddm ON ddm.id_descarga_detalles = dd.id_descarga_detalles
      JOIN materiales md ON md.id_materiales_descarga = ddm.id_materiales
      LEFT JOIN tipos_material tm ON tm.id = md.tipo_material_id
      LEFT JOIN materiales_base mb ON mb.id = md.material_base_id
      LEFT JOIN formas_material fm ON fm.id = md.forma_material_id
      LEFT JOIN estados_material em ON em.id = md.estado_material_id
      ORDER BY dd.marca_temporal_info DESC
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const groupedData = rows.reduce((acc, row) => {
      const {
        id_descarga_detalles,
        porcentaje,
        material_descarga_id,
        tipo_material_descarga,
        material_base_descarga,
        forma_material_descarga,
        estado_material_descarga
      } = row;

      if (!acc[id_descarga_detalles]) {
        acc[id_descarga_detalles] = { ...row, materiales_descarga: [] };
      }

      acc[id_descarga_detalles].materiales_descarga.push({
        material_descarga_id,
        tipo_material_descarga,
        material_base_descarga,
        forma_material_descarga,
        estado_material_descarga,
        porcentaje
      });

      return acc;
    }, {});

    res.json(Object.values(groupedData));

  } catch (error) {
    console.error("ERROR GET RECICLABILIDAD:", error);
    res.status(500).json({
      error: "Error al obtener datos de reciclabilidad",
      detalle: error.message,
      sql: error.sql ?? null
    });
  }
};