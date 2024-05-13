const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CircuitRamassage = sequelize.define("circuit_ramassage", {
  ID_Circuit: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_circuit: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ID_Route: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ID_Benevole: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "circuit_ramassage",
  timestamps: false
});

module.exports = CircuitRamassage;