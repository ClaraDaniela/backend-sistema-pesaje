import axios from "axios";
import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";
import { obtenerPesoBalanza } from "./balanza.controller.js";

const models = initModels(sequelize);

const {
  pesadas: Pesada,
  vehiculos: Vehiculo,
  tipos_vehiculo: TipoVehiculo,
  cajas: Caja,
  materiales_generales: MaterialGeneral
} = models;

// La balanza tiene pesos fantasma: negativos o menores a este valor se toman como 0
const UMBRAL_PESO_FANTASMA_KG = 100;

// Peso declarado:
//   undefined      -> no vino en el request
//   null / ""      -> sin peso declarado (null)
//   número >= 0    -> el número
//   otra cosa      -> NaN (inválido: negativo, texto, etc.)
const parsePesoDeclarado = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
};

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

    // --- Validaciones básicas ---
    if (!tipo_movimiento || !empresa_id || !personal_id || !material_general_id || !vehiculo_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // --- Peso declarado (no puede ser negativo) ---
    const pesoDeclarado = parsePesoDeclarado(peso_declarado_kg);
    if (Number.isNaN(pesoDeclarado)) {
      return res.status(400).json({ error: "Peso declarado inválido" });
    }

    // --- Vehículo ---
    const vehiculo = await Vehiculo.findByPk(vehiculo_id, {
      include: [{ model: TipoVehiculo, as: "tipo_vehiculo" }]
    });

    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // --- Caja (solo ROLL OFF) ---
    let cajaFinal = null;
    let taraCaja = 0;

    if (vehiculo.tipo_vehiculo?.nombre === "ROLL OFF") {
      if (!caja_id) {
        return res.status(400).json({ error: "Debe seleccionar una caja" });
      }

      const caja = await Caja.findByPk(caja_id);
      if (!caja) {
        return res.status(404).json({ error: "Caja no encontrada" });
      }

      cajaFinal = caja_id;
      taraCaja = Number(caja.tara_kg || 0);
    }

    // --- Validación modo MANUAL ---
    if (modo === "MANUAL") {
      if (password_manual !== process.env.MANUAL_AUTH_PASSWORD) {
        return res.status(403).json({ error: "No autorizado" });
      }
      if (!motivo_manual?.trim()) {
        return res.status(400).json({ error: "Debe indicar el motivo" });
      }
    }

    // --- Obtener peso bruto ---
    let pesoBruto = null;
    let origen = "MANUAL";

    if (!modo || modo === "AUTOMATICO") {
      try {
        const bData = await obtenerPesoBalanza();
        if (bData?.disponible && bData?.peso_kg != null) {
          const deBalanza = Number(bData.peso_kg);
          if (Number.isFinite(deBalanza)) {
            pesoBruto = deBalanza;
            origen = "BALANZA";
          }
        }
      } catch { }
    }

    if (pesoBruto == null) {
      const manual = Number(peso_manual);
      if (!Number.isFinite(manual) || manual < 0) {
        return res.status(400).json({
          error: "No se pudo obtener peso de balanza y no se proporcionó peso manual válido"
        });
      }
      pesoBruto = manual;
      origen = "MANUAL";
    }

    // --- Normalizar peso: negativos y pesos fantasma de la balanza pasan a 0 ---
    if (pesoBruto < UMBRAL_PESO_FANTASMA_KG) pesoBruto = 0;

    // --- Tara manual (no puede ser negativa) ---
    let taraManual = null;

    if (tara_real_kg != null && tara_real_kg !== "") {
      taraManual = Number(tara_real_kg);
      if (!Number.isFinite(taraManual) || taraManual < 0) {
        return res.status(400).json({ error: "Tara inválida" });
      }
    }

    const cerrarManual = taraManual != null;

    // --- No permitir tara mayor al bruto ---
    if (cerrarManual && pesoBruto - taraManual < 0) {
      return res.status(400).json({
        error: "Tara mal cargada: no puede ser mayor al peso bruto"
      });
    }

    const esSinCarga = pesoBruto === 0;

    const estadoFinal =
      cerrarManual || esSinCarga ? "CERRADA_AUTOMATICA" : "ABIERTA";

    const taraFinal =
      cerrarManual ? taraManual
        : esSinCarga ? pesoBruto
          : null;

    // --- Crear pesada ---
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
      motivo_manual: origen === "MANUAL" ? motivo_manual : null,
      tara_real_kg: taraFinal,
      estado: estadoFinal,
      fecha_cierre: estadoFinal !== "ABIERTA" ? new Date() : null,
      modo_salida:
        cerrarManual ? "MANUAL"
          : esSinCarga ? "AUTOMATICO"
            : null,
      nro_manifiesto: nro_manifiesto || null,
      nro_remito: nro_remito || null,
      peso_declarado_kg: pesoDeclarado || null
    });

    // --- Respuesta ---
    if (estadoFinal !== "ABIERTA") {
      const [row] = await sequelize.query(
        `SELECT * FROM vw_pesadas_con_neto WHERE id = :id`,
        { replacements: { id: pesada.id }, type: sequelize.QueryTypes.SELECT }
      );

      const tipo =
        row?.dentro_tolerancia === null || row?.dentro_tolerancia === 1
          ? "ok"
          : "fuera_tolerancia";

      return res.status(201).json({
        ...row,
        tipo,
        mensaje:
          tipo === "ok"
            ? "Pesada registrada correctamente"
            : `Diferencia de ${Math.abs(row.diferencia_kg).toFixed(0)} kg respecto al peso declarado`,
        id: row.id,
      });
    }

    return res.status(201).json({
      ...pesada.toJSON(),
      tipo: "ok",
      mensaje: "Pesada registrada. Pendiente de cierre.",
    });

  } catch (err) {
    console.error("ERROR CREATE PESADA:", err);
    return res.status(500).json({ error: "Error al crear pesada" });
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
        WHERE id NOT IN (SELECT id FROM pesadas WHERE eliminado = 1)
        ${where.length ? "AND " + where.join(" AND ") : ""}
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

    // --- Peso declarado (no puede ser negativo) ---
    const pesoDeclarado = parsePesoDeclarado(peso_declarado_kg);
    if (Number.isNaN(pesoDeclarado)) {
      return res.status(400).json({ error: "Peso declarado inválido" });
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

    // --- No permitir que el nuevo bruto quede por debajo de la tara ya cargada ---
    if (pesada.tara_real_kg != null && pesoBruto - Number(pesada.tara_real_kg) < 0) {
      return res.status(400).json({
        error: "Tara mal cargada: el peso bruto no puede ser menor a la tara ya registrada"
      });
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
      peso_declarado_kg:
        pesoDeclarado === undefined
          ? pesada.peso_declarado_kg
          : (pesoDeclarado || null),
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
      LEFT JOIN descarga_detalles d ON d.pesada_id = p.id
      WHERE d.pesada_id IS NULL
        AND p.estado IN ('CERRADA', 'CERRADA_AUTOMATICA')
        AND p.tipo_movimiento = 'INGRESO'
        AND (
          p.peso_neto_real_kg > 0
          OR p.peso_neto_estimado_kg > 0
        )
        AND UPPER(TRIM(p.material)) != 'VACIO'
        AND p.id NOT IN (SELECT id FROM pesadas WHERE eliminado = 1)  
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

    let pesoSalida = Number(tara_real_kg);

    if (!Number.isFinite(pesoSalida)) {
      return res.status(400).json({
        error: "Peso inválido"
      });
    }

    if (modo_salida === "MANUAL") {
      // Carga manual: un negativo es un error de tipeo, se rechaza
      if (pesoSalida < 0) {
        return res.status(400).json({
          error: "Peso inválido"
        });
      }
    } else if (pesoSalida < UMBRAL_PESO_FANTASMA_KG) {
      // Balanza: negativos y pesos fantasma se toman como 0
      pesoSalida = 0;
    }

    const pesoBrutoOriginal = Number(pesada.peso_bruto_kg);

    // --- El mayor de los dos pesos es el bruto, el menor es la tara ---
    // (cubre EGRESO: a veces se pesa primero el vacío y después el cargado)
    let pesoBrutoFinal = pesoBrutoOriginal;
    let taraFinal = pesoSalida;

    if (pesoSalida > pesoBrutoOriginal) {
      pesoBrutoFinal = pesoSalida;
      taraFinal = pesoBrutoOriginal;
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
      peso_bruto_kg: pesoBrutoFinal,
      tara_real_kg: taraFinal,

      modo_salida,

      motivo_manual:
        modo_salida === "MANUAL"
          ? motivo_manual
          : pesada.motivo_manual,

      estado: "CERRADA",

      fecha_cierre: new Date()
    });

    const [row] = await sequelize.query(
      `SELECT * FROM vw_pesadas_con_neto WHERE id = :id`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );

    const dentroTolerancia = row?.dentro_tolerancia;

    const tipo =
      dentroTolerancia === null || dentroTolerancia === 1
        ? "ok"
        : "fuera_tolerancia";

    return res.json({
      ...row,
      tipo,
      mensaje:
        tipo === "ok"
          ? "Pesada cerrada correctamente"
          : `Diferencia de ${Math.abs(row.diferencia_kg).toFixed(0)} kg respecto al peso declarado`,
      id: row.id,
    });

  } catch (err) {
    console.error("ERROR CERRAR PESADA:", err);

    return res.status(500).json({
      error: "Error al cerrar pesada"
    });
  }
};

export const deletePesada = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    const pesada = await Pesada.findByPk(id);

    if (!pesada) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    if (pesada.eliminado) {
      return res.status(400).json({ error: "La pesada ya fue eliminada" });
    }

    await pesada.update({
      eliminado: true,
      eliminado_en: new Date(),
      eliminado_por: usuario_id || null,
    });

    return res.json({ ok: true, mensaje: "Pesada eliminada correctamente" });

  } catch (err) {
    console.error("ERROR DELETE PESADA:", err);
    return res.status(500).json({ error: "Error al eliminar la pesada" });
  }
};