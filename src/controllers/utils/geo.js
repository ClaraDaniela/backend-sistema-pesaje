import { OpenLocationCode } from 'open-location-code';
import planta from '../../config/planta.js';

const olc = new OpenLocationCode();
const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;

export const distanciaM = (lat1, lng1, lat2, lng2) => {
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const parseUbicacion = (texto) => {
  const t = (texto || '').trim();
  if (!t) return null;

  const m = t.match(/^(-?\d+(?:[.,]\d+)?)\s*[,; ]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (m) {
    const lat = Number(m[1].replace(',', '.'));
    const lng = Number(m[2].replace(',', '.'));
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng, plusCode: null };
  }

  const code = t.split(/\s+/)[0].toUpperCase();
  try {
    let full = code;
    if (olc.isShort(code)) full = olc.recoverNearest(code, planta.lat, planta.lng);
    else if (!olc.isFull(code)) return null;
    const a = olc.decode(full);
    return { lat: a.latitudeCenter, lng: a.longitudeCenter, plusCode: code };
  } catch {
    return null;
  }
};