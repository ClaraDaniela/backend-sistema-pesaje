import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { descarga_detalles, MaterialDescarga, pesadas } = models;


export const createDescarga = async (req, res) => {
  const { pesada_id, responsable, comentarios, materiales } = req.body;

  const t = await sequelize.transaction();

  try {
    if (!pesada_id || !materiales || !materiales.length) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const total = materiales.reduce(
      (acc, m) => acc + Number(m.porcentaje || 0),
      0
    );

    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({
        error: "Los porcentajes deben sumar 100%"
      });
    }

    const ids = materiales.map(m => m.id);
    if (ids.length !== new Set(ids).size) {
      return res.status(400).json({
        error: "Materiales duplicados"
      });
    }

    for (const mat of materiales) {
      if (!mat.id || mat.porcentaje <= 0 || mat.kg < 0) {
        return res.status(400).json({
          error: "Datos de materiales inválidos"
        });
      }
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
      await MaterialDescarga.create({
        id_descarga_detalles: descarga.id_descarga_detalles,
        id_materiales_descarga: mat.id,
        porcentaje: mat.porcentaje,
        kg: mat.kg
      }, { transaction: t });
    }

    await Pesada.update(
      { estado: "DESCARGADO" },
      { where: { id: pesada_id }, transaction: t }
    );

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
          attributes: ["porcentaje", "kg"]
        }
      }
    });

    res.json(descarga);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};