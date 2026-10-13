import { Sequelize, DataTypes } from 'sequelize';
import defineTracker from '../models/tracker.js';
import defineLocationLog from '../models/locationlog.js';

export const trackingDb = new Sequelize(
  process.env.TRACK_DB_NAME,
  process.env.TRACK_DB_USER,
  process.env.TRACK_DB_PASS,
  { host: process.env.TRACK_DB_HOST, dialect: 'mysql', logging: false }
);

export const Tracker = defineTracker(trackingDb, DataTypes);
export const LocationLog = defineLocationLog(trackingDb, DataTypes);