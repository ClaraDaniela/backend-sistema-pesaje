import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const InventarioFisico = sequelize.define("inventario_fisico", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  cantidad: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "inventario_fisico",
  timestamps: false,
});