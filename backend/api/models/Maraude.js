const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Volunteer = require('./Volunteer');

const Maraude = sequelize.define('maraude', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  LieuDepart: {
    type: DataTypes.STRING,
    allowNull: false
  },
  LieuArrivee: {
    type: DataTypes.STRING,
    allowNull: false
  },
  DateDebut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT
  },
  ChauffeurID: {
    type: DataTypes.INTEGER,
    references: {
      model: 'benevoles', // Ensure this matches the name used in sequelize.define() for the Benevole model
      key: 'id' // Assume primary key is 'ID' in the Benevole model
    }
  },
  StockID: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'Stocks',  // Changed to 'Stock', assuming you are using a singular naming convention
      key: 'ID_Stock'  // Assume primary key is 'ID' in the Stock model
    }
  }
}, {
    tableName: "maraude",
    timestamps: false
});
Maraude.belongsTo(Volunteer, { foreignKey: 'ChauffeurID', as: 'Chauffeur' });
console.log(Maraude.associations);


// Maraude.associate = function(models) {
//   Maraude.belongsTo(models.Volunteer, {
//     foreignKey: 'ChauffeurID',
//     as: 'Chauffeur'
//   });
  // Maraude.belongsTo(models.Stocks, {
  //   foreignKey: 'StockID',
  //   as: 'Stock'
  // });


module.exports = Maraude;
