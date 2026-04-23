import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const DescargaDetalle = sequelize.define("descarga_detalles", {
  id_descarga_detalles: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  marca_temporal_info: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responsable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "personal",
      key: "id_personal",
    },
  },
  id_viaje: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "viaje",
      key: "id_viaje",
    },
  },
}, {
  tableName: "descarga_detalles",
  timestamps: false,
  indexes: [
    {
      name: "fk_Ingreso_Materiales_Personal1_idx",
      fields: ["responsable"],
    },
    {
      name: "fk_Ingreso_Materiales_Viaje1_idx",
      fields: ["id_viaje"],
    },
  ],
});