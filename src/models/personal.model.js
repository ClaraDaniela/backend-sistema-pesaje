import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Personal = sequelize.define("personal", {
  id_personal: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  id_tipo_personal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "tipo_personal",
      key: "id_tipo_personal",
    },
  },
}, {
  tableName: "personal",
  timestamps: false,
  indexes: [
    {
      name: "fk_Personal_Tipo_Personal1_idx",
      fields: ["id_tipo_personal"],
    },
  ],
});