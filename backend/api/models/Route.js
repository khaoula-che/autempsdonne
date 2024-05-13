const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Route = sequelize.define('Route', {
  ID_Route: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plan_route: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'routes', 
  timestamps: false 
});

module.exports = Route;