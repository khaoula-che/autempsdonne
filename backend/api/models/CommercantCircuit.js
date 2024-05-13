const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CommercantCircuit = sequelize.define("commercant_circuit", {
  // Define the primary key explicitly
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_Commercant: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ID_Circuit: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "commercant_circuit",
  timestamps: false
});

module.exports = CommercantCircuit;