import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Vehiculo = sequelize.define("vehiculos", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patente: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(100), allowNull: true },
  tipo_vehiculo_id: { type: DataTypes.INTEGER, allowNull: false },
  tara_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false });
