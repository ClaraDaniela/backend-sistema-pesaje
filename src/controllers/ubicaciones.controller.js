import { Op, QueryTypes } from "sequelize";
import { Tracker, LocationLog } from "../config/tracking.js";
import * as dbModule from "../config/db.js";
import planta from "../config/planta.js";
import { distanciaM } from "../controllers/utils/geo.js";

const VENTANA_MIN = 60;
const COL_FECHA = "fecha_hora"; // AJUSTAR: nombre de la columna de fecha/hora en la tabla pesadas

// Conexión a la base de pesadas (solo se usa para leer)
const sequelize = dbModule.default ?? dbModule.sequelize ?? dbModule.db ?? dbModule.pesadasDb;

const consultarPesadas = (sql, replacements) => {
  if (!sequelize) {
    throw new Error("No encuentro la conexión de pesadas en src/config/db.js (revisá cómo la exporta)");
  }
  return sequelize.query(sql, { replacements, type: QueryTypes.SELECT });
};

// Muestra el error real (en la terminal y en el cuadro rojo de la pantalla)
const fallo = (res, etiqueta, error) => {
  console.error(`[ubicaciones] ${etiqueta}:`, error);
  return res.status(500).json({ error: error.message });
};

const distPlanta = (l) => distanciaM(Number(l.lat), Number(l.lng), planta.lat, planta.lng);
const diff = (a, b) => Math.abs(new Date(a).getTime() - b);

// ---------- Trackers ----------
export const getTrackers = async (_req, res) => {
  try {
    res.json(await Tracker.findAll({ order: [["codigo", "ASC"]] }));
  } catch (e) { fallo(res, "getTrackers", e); }
};

export const createTracker = async (req, res) => {
  try {
    const { codigo, patente } = req.body;
    const t = await Tracker.create({
      codigo: codigo.trim(),
      patente: patente ? patente.trim().toUpperCase() : null,
      cajaDesde: patente ? new Date() : null,
    });
    res.status(201).json(t);
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Ese código ya existe" });
    }
    fallo(res, "createTracker", e);
  }
};

export const updateTracker = async (req, res) => {
  try {
    const t = await Tracker.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: "No existe" });
    const { patente, activo } = req.body;
    if (patente !== undefined) {
      const nueva = patente ? patente.trim().toUpperCase() : null;
      if (nueva !== t.patente) {
        t.patente = nueva;
        t.cajaDesde = new Date(); // el contador de días quieto arranca de nuevo
      }
    }
    if (activo !== undefined) t.activo = !!activo;
    await t.save();
    res.json(t);
  } catch (e) { fallo(res, "updateTracker", e); }
};

// ---------- Logs ----------
export const getLogs = async (req, res) => {
  try {
    const { trackerId, from, to } = req.query;
    const where = {};
    if (trackerId) where.trackerId = trackerId;
    if (from || to) {
      where.recordedAt = {
        ...(from && { [Op.gte]: new Date(from) }),
        ...(to && { [Op.lte]: new Date(to) }),
      };
    }
    res.json(await LocationLog.findAll({ where, order: [["recordedAt", "DESC"]], limit: 200 }));
  } catch (e) { fallo(res, "getLogs", e); }
};

export const createLog = async (req, res) => {
  try {
    const { trackerId, place, note, recordedAt } = req.body;
    const coords = req.coords;
    const log = await LocationLog.create({
      trackerId,
      place: place || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      plusCode: coords?.plusCode ?? null,
      note: note || null,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      createdBy: req.user?.nombreusuario ?? req.user?.username ?? null,
    });
    res.status(201).json(log);
  } catch (e) { fallo(res, "createLog", e); }
};

export const deleteLog = async (req, res) => {
  try {
    await LocationLog.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { fallo(res, "deleteLog", e); }
};

// ---------- Estado de cada tracker ----------
export const getEstado = async (_req, res) => {
  try {
    const trackers = await Tracker.findAll({ where: { activo: true }, order: [["codigo", "ASC"]], raw: true });
    const codigos = trackers.map((t) => t.codigo);
    const patentes = trackers.map((t) => t.patente).filter(Boolean);

    const logs = codigos.length
      ? await LocationLog.findAll({
        where: { trackerId: { [Op.in]: codigos } },
        order: [["recordedAt", "DESC"]],
        raw: true,
      })
      : [];

    // Pesadas de los últimos 30 días de esos camiones
    const pesadas = patentes.length
      ? await consultarPesadas(
        `SELECT v.patente, p.${COL_FECHA} AS fecha_hora
             FROM pesadas p
             JOIN vehiculos v ON v.id = p.vehiculo_id
            WHERE p.eliminado = 0
              AND p.${COL_FECHA} >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND v.patente IN (:patentes)
            ORDER BY p.${COL_FECHA} DESC`,
        { patentes }
      )
      : [];

    const margen = VENTANA_MIN * 60 * 1000;

    const detalle = trackers.map((t) => {
      const susLogs = logs.filter((l) => l.trackerId === t.codigo);
      const ultimo = susLogs[0] || null;
      const ultimaPesada = t.patente
        ? pesadas.find((p) => (p.patente || "").toUpperCase() === t.patente.toUpperCase())
        : null;

      let ubicacion = null;
      if (ultimo) {
        const d = ultimo.lat != null ? Math.round(distPlanta(ultimo)) : null;
        ubicacion = {
          hora: ultimo.recordedAt,
          lugar: ultimo.place,
          distanciaPlantaM: d,
          enPlanta: d == null ? null : d <= planta.radioM,
        };
      }

      let verificacion = "SIN_PESADA";
      if (!t.patente) verificacion = "SIN_CAMION";
      else if (ultimaPesada) {
        const tp = new Date(ultimaPesada.fecha_hora).getTime();
        const cerca = susLogs
          .filter((l) => diff(l.recordedAt, tp) <= margen)
          .sort((a, b) => diff(a.recordedAt, tp) - diff(b.recordedAt, tp))[0];
        if (!cerca) verificacion = "SIN_DATO";
        else if (cerca.lat == null) verificacion = "REVISAR";
        else verificacion = distPlanta(cerca) <= planta.radioM ? "COINCIDE" : "DISCREPANCIA";
      }

      return {
        trackerId: t.codigo,
        patente: t.patente,
        ubicacion,
        ultimaPesada: ultimaPesada ? { fecha: ultimaPesada.fecha_hora, tipo: null } : null,
        verificacion,
      };
    });

    res.json(detalle);
  } catch (e) { fallo(res, "getEstado", e); }
};