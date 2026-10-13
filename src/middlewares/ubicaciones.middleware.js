import { parseUbicacion } from "../controllers/utils/geo.js";

export const validarTracker = (req, res, next) => {
  const { codigo } = req.body;
  if (!codigo || !String(codigo).trim()) {
    return res.status(400).json({ error: "Falta el código" });
  }
  next();
};

export const validarLog = (req, res, next) => {
  const { trackerId, place, ubicacion } = req.body;
  if (!trackerId) return res.status(400).json({ error: "Falta el tracker" });

  let coords = null;
  if (ubicacion && String(ubicacion).trim()) {
    coords = parseUbicacion(ubicacion);
    if (!coords) {
      return res.status(400).json({ error: 'No entendí la ubicación. Pegá un Plus Code o "lat, lng"' });
    }
  }
  if (!place && !coords) {
    return res.status(400).json({ error: "Cargá un lugar o una ubicación" });
  }

  req.coords = coords; // lo usa el controller
  next();
};