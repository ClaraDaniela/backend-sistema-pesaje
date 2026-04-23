import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const TipoVehiculo = sequelize.define("tipos_vehiculo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING(30), allowNull: false, unique: true },
}, { timestamps: false });
