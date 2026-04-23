import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const TipoCaja = sequelize.define("tipos_caja", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(30), allowNull: false, unique: true },
}, { timestamps: false });
