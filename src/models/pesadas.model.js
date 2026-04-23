import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Pesada = sequelize.define(
  "pesadas",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    tipo_movimiento: {
      type: DataTypes.ENUM("INGRESO", "EGRESO"),
      allowNull: false,
    },

    empresa_id: { type: DataTypes.INTEGER, allowNull: false },
    personal_id: { type: DataTypes.INTEGER, allowNull: false },
    material_id: { type: DataTypes.INTEGER, allowNull: false },
    vehiculo_id: { type: DataTypes.INTEGER, allowNull: false },

    caja_id: { type: DataTypes.INTEGER, allowNull: true },

    peso_bruto_kg: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    origen: {
      type: DataTypes.ENUM("BALANZA", "MANUAL"),
      allowNull: false,
    },
    motivo_manual: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  },

  { timestamps: false }
);
