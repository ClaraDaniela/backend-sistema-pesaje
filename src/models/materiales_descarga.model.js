import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const MaterialDescarga = sequelize.define(
  "materiales_descarga",
  {
    id_materiales_descarga: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  },
  {
    tableName: "materiales_descarga",
    timestamps: false,
  }
);