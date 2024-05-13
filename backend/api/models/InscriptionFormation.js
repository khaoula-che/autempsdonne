const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Volunteer = require('./Volunteer');
const Formation = require('./Formation');

const InscriptionFormation = sequelize.define('inscriptionsformations', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true
  },
  id_formation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Formation,
      key: "ID_Formation",
      unique: true
    }
  },
  id_benevole: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Volunteer,
      key: "id",
      unique: true
    }
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,  
});

// Set up the associations
Volunteer.hasMany(InscriptionFormation, { foreignKey: 'id_benevole' });
InscriptionFormation.belongsTo(Volunteer, { foreignKey: 'id_benevole', as: 'volunteer' });

InscriptionFormation.belongsTo(Formation, { foreignKey: 'id_formation', as: 'Formation' });
Formation.hasMany(InscriptionFormation, { foreignKey: 'id_formation' });

module.exports = InscriptionFormation;
