import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Material = sequelize.define("materiales", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { timestamps: false });
