import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Caja = sequelize.define("cajas", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tipo_caja_id: { type: DataTypes.INTEGER, allowNull: false },
  codigo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  tara_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false });
