import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Empresa = sequelize.define("empresas", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  cuit: { type: DataTypes.STRING(25), allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
});
