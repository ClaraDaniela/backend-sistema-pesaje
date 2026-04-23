import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const DescargaDetalleMaterial = sequelize.define(
  "descarga_detalles_materiales_descarga",
  {
    id_descarga_detalles: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_materiales_descarga: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    porcentaje: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "descarga_detalles_materiales_descarga",
    timestamps: false,
  }
);