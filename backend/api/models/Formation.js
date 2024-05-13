const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Lieu = require('./Lieu');

const Formation = sequelize.define('formation', {
  ID_Formation: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  titre: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT, 
  },
  date_debut: { 
    type: DataTypes.DATE, 
  },
  date_fin: { 
    type: DataTypes.DATE, 
  },
  heure_debut: { 
    type: DataTypes.TIME, 
  },
  heure_fin: { 
    type: DataTypes.TIME, 
  },
  id_lieu: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  timestamps: false,
  tableName: 'formations'
});

Formation.belongsTo(Lieu, { foreignKey: 'id_lieu', as: 'lieuF' });

module.exports = Formation;
