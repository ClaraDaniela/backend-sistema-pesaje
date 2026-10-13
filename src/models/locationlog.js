// models/LocationLog.js
export default (sequelize, DataTypes) =>
  sequelize.define('LocationLog', {
    trackerId:  { type: DataTypes.STRING(64), allowNull: false }, // codigo del tracker
    place:      DataTypes.STRING(255),
    lat:        DataTypes.DECIMAL(9, 6),
    lng:        DataTypes.DECIMAL(9, 6),
    plusCode:   DataTypes.STRING(64),   // lo que se pegó, para trazabilidad
    note:       DataTypes.TEXT,
    recordedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdBy:  DataTypes.STRING(64),
  }, {
    tableName: 'location_logs',
    indexes: [{ fields: ['trackerId', 'recordedAt'] }],
  });