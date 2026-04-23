import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Chofer = sequelize.define("choferes", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: false });
