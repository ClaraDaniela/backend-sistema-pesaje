import axios from "axios";
import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);

const {
  pesadas: Pesada,
  vehiculos: Vehiculo,
  tipos_vehiculo: TipoVehiculo,
  cajas: Caja,
  materiales_generales: MaterialGeneral
} = models;

export const createPesada = async (req, res) => {
  try {
    const {
      tipo_movimiento,
      empresa_id,
      personal_id,
      material_general_id,
      vehiculo_id,
      caja_id,
      peso_manual,
      modo,
      usuario_id,
      password_manual,
      motivo_manual,
      nro_manifiesto,
      nro_remito,
      peso_declarado_kg,
      tara_real_kg
    } = req.body;

    if (!tipo_movimiento || !empresa_id || !personal_id || !material_general_id || !vehiculo_id) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const vehiculo = await Vehiculo.findByPk(vehiculo_id, {
      include: [{
        model: TipoVehiculo,
        as: "tipo_vehiculo"
      }]
    });

    if (!vehiculo) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    let cajaFinal = null;
    let taraCaja = 0;

    const tipoVehiculo = vehiculo.tipo_vehiculo?.nombre;

    if (tipoVehiculo === "ROLL OFF") {
      if (!caja_id) {
        return res.status(400).json({
          error: "Debe seleccionar una caja"
        });
      }

      const caja = await Caja.findByPk(caja_id);

      if (!caja) {
        return res.status(404).json({
          error: "Caja no encontrada"
        });
      }

      cajaFinal = caja_id;
      taraCaja = Number(caja.tara_kg || 0);
    }

    if (modo === "MANUAL") {
      if (password_manual !== process.env.MANUAL_AUTH_PASSWORD) {
        return res.status(403).json({
          error: "No autorizado"
        });
      }

      if (!motivo_manual?.trim()) {
        return res.status(400).json({
          error: "Debe indicar el motivo"
        });
      }
    }

    let pesoBruto = null;
    let origen = "MANUAL";

    if (!modo || modo === "AUTOMATICO") {
      try {
        const { data } = await axios.get(
          `${process.env.BALANZA_URL}/peso`,
          { timeout: 2000 }
        );

        if (data?.disponible && data?.peso_kg != null) {
          pesoBruto = Number(data.peso_kg);
          origen = "BALANZA";
        }
      } catch { }
    }

    if (pesoBruto == null) {
      const manual = Number(peso_manual);

      if (!Number.isFinite(manual) || manual < 0) {
        return res.status(400).json({
          error: "Peso inválido"
        });
      }

      pesoBruto = manual;
      origen = "MANUAL";
    }

    const taraVehiculo = Number(vehiculo.tara_kg || 0);
    const taraTotal = taraVehiculo + taraCaja;

    const toleranciaVacio = 150;

    const taraManual =
      tara_real_kg != null &&
        tara_real_kg !== ""
        ? Number(tara_real_kg)
        : null;
    const material = await MaterialGeneral.findByPk(material_general_id);
    const esSinCarga = pesoBruto === 0 && material?.nombre === "VACIO";
    const estaVacioAutomatico =
      Math.abs(pesoBruto - taraTotal) <= toleranciaVacio;


    const cerrarManual =
      taraManual != null &&
      Number.isFinite(taraManual);

    const estadoFinal =
      cerrarManual || estaVacioAutomatico || esSinCarga
        ? "CERRADA_AUTOMATICA"
        : "ABIERTA";

    const taraFinal =
      cerrarManual
        ? taraManual
        : estaVacioAutomatico || esSinCarga
          ? pesoBruto
          : null;

    const pesada = await Pesada.create({
      tipo_movimiento,
      empresa_id,
      personal_id,
      material_general_id,
      vehiculo_id,
      caja_id: cajaFinal,

      peso_bruto_kg: pesoBruto,
      origen,

      usuario_id: usuario_id || null,

      motivo_manual:
        origen === "MANUAL"
          ? motivo_manual
          : null,

      tara_real_kg: taraFinal,

      estado: estadoFinal,

      fecha_cierre:
        estadoFinal !== "ABIERTA"
          ? new Date()
          : null,

      modo_salida:
        cerrarManual
          ? "MANUAL"
          : estaVacioAutomatico
            ? "AUTOMATICO"
            : null,

      nro_manifiesto: nro_manifiesto || null,
      nro_remito: nro_remito || null,
      peso_declarado_kg: peso_declarado_kg || null
    });

    return res.status(201).json(pesada);

  } catch (err) {
    console.error("ERROR CREATE PESADA:", err);

    return res.status(500).json({
      error: "Error al crear pesada"
    });
  }
};


export const getPesadaById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await sequelize.query(
      `
      SELECT *
      FROM vw_pesadas_con_neto
      WHERE id = :id
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    return res.json(rows[0]);

  } catch (err) {
    console.error("ERROR GET PESADA:", err);
    return res.status(500).json({ error: "Error al obtener la pesada" });
  }
};


export const getPesadas = async (req, res) => {
  try {
    const {
      empresa_id,
      vehiculo_id,
      tipo_vehiculo_id,
      desde,
      hasta,
    } = req.query;

    const where = [];
    const replacements = {};

    if (empresa_id) {
      where.push("empresa_id = :empresa_id");
      replacements.empresa_id = Number(empresa_id);
    }

    if (vehiculo_id) {
      where.push("vehiculo_id = :vehiculo_id");
      replacements.vehiculo_id = Number(vehiculo_id);
    }

    if (tipo_vehiculo_id) {
      where.push("tipo_vehiculo_id = :tipo_vehiculo_id");
      replacements.tipo_vehiculo_id = Number(tipo_vehiculo_id);
    }

    if (desde) {
      where.push("fecha >= :desde");
      replacements.desde = `${desde} 00:00:00`;
    }

    if (hasta) {
      where.push("fecha <= :hasta");
      replacements.hasta = `${hasta} 23:59:59`;
    }

    const query = `
      SELECT *
      FROM vw_pesadas_con_neto
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY fecha DESC
      LIMIT 200
    `;

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    return res.json(rows);

  } catch (err) {
    console.error("ERROR GET PESADAS:", err);
    return res.status(500).json({ error: "Error al obtener pesadas" });
  }
};


export const updatePesada = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      tipo_movimiento,
      empresa_id,
      personal_id,
      material_general_id,
      vehiculo_id,
      caja_id,
      peso_manual,
      nro_manifiesto,
      nro_remito,
      peso_declarado_kg,
      usuario_id,
    } = req.body;

    const pesada = await Pesada.findByPk(id);

    if (!pesada) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    if (!tipo_movimiento || !empresa_id || !personal_id || !material_general_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    let pesoBruto = pesada.peso_bruto_kg;

    if (peso_manual != null) {
      if (pesada.origen !== "MANUAL") {
        return res.status(403).json({
          error: "No se puede modificar el peso de una pesada de balanza",
        });
      }

      const manual = Number(peso_manual);

      if (!Number.isFinite(manual) || manual <= 0) {
        return res.status(400).json({ error: "Peso manual inválido" });
      }

      pesoBruto = manual;
    }

    await pesada.update({
      tipo_movimiento,
      empresa_id,
      personal_id,
      material_general_id,
      vehiculo_id: vehiculo_id || pesada.vehiculo_id,
      caja_id: caja_id !== undefined ? (caja_id || null) : pesada.caja_id,
      peso_bruto_kg: pesoBruto,
      usuario_id: usuario_id || pesada.usuario_id,
      nro_manifiesto,
      nro_remito,
      peso_declarado_kg
    });

    return res.json({ ok: true });

  } catch (err) {
    console.error("ERROR UPDATE PESADA:", err);
    return res.status(500).json({ error: "Error al actualizar pesada" });
  }
};

export const getPesadasSinDescarga = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `
SELECT p.*
FROM vw_pesadas_con_neto p
LEFT JOIN descarga_detalles d 
  ON d.pesada_id = p.id
WHERE d.pesada_id IS NULL
  AND (
    p.peso_neto_real_kg > 0
    OR p.peso_neto_estimado_kg > 0
  )
ORDER BY p.fecha DESC
LIMIT 200
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.json(rows);

  } catch (err) {
    console.error("ERROR GET PESADAS SIN DESCARGA:", err);
    return res.status(500).json({ error: "Error al obtener pesadas" });
  }
};

export const cerrarPesada = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      tara_real_kg,
      modo_salida,
      password_manual,
      motivo_manual
    } = req.body;

    const pesada = await Pesada.findByPk(id);

    if (!pesada) {
      return res.status(404).json({
        error: "Pesada no encontrada"
      });
    }

    if (pesada.estado !== "ABIERTA") {
      return res.status(400).json({
        error: "La pesada ya está cerrada"
      });
    }

    const pesoSalida = Number(tara_real_kg);

    if (!Number.isFinite(pesoSalida) || pesoSalida < 0) {
      return res.status(400).json({
        error: "Peso inválido"
      });
    }

    if (modo_salida === "MANUAL") {
      if (password_manual !== process.env.MANUAL_AUTH_PASSWORD) {
        return res.status(403).json({
          error: "No autorizado"
        });
      }

      if (!motivo_manual?.trim()) {
        return res.status(400).json({
          error: "Debe indicar un motivo"
        });
      }
    }

    await pesada.update({
      tara_real_kg: pesoSalida,

      modo_salida,

      motivo_manual:
        modo_salida === "MANUAL"
          ? motivo_manual
          : pesada.motivo_manual,

      estado: "CERRADA",

      fecha_cierre: new Date()
    });

    const pesadaActualizada = await Pesada.findByPk(id);

    return res.json(pesadaActualizada);

  } catch (err) {
    console.error("ERROR CERRAR PESADA:", err);

    return res.status(500).json({
      error: "Error al cerrar pesada"
    });
  }
};
