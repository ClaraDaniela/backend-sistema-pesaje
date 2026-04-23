import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const TipoPersonal = sequelize.define("tipo_personal", {
  id_tipo_personal: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "tipo_personal",
  timestamps: false,
});