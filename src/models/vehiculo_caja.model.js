import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const VehiculoCaja = sequelize.define("vehiculo_caja", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehiculo_id: { type: DataTypes.INTEGER, allowNull: false },
  caja_id: { type: DataTypes.INTEGER, allowNull: false },
  desde: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  hasta: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: false });
