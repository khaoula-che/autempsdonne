const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Lieu = require('./Lieu');
const Service = require('./Service');
const Volunteer = require('./Volunteer');
const Beneficiary = require('./Beneficiary');

const ActivityPrive = sequelize.define('activites_prives', {
  ID_Activite: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  description: { type: Sequelize.TEXT, allowNull: false },
  date_activite: { type: Sequelize.DATE, allowNull: false },
  heure_debut: { type: Sequelize.TIME, allowNull: false },
  heure_fin: { type: Sequelize.TIME, allowNull: false },
  titre: { type: Sequelize.STRING(100), allowNull: false },
  id_lieu: { type: Sequelize.INTEGER },
  nom_service: { type: Sequelize.STRING(100) },
  id_beneficiaire: { type: Sequelize.INTEGER },
  id_benevole: { type: Sequelize.INTEGER },
  image :  { type: Sequelize.STRING(255) },

}, {
  timestamps: false
});

// Set associations directly
ActivityPrive.belongsTo(Lieu, { foreignKey: 'id_lieu', as: 'lieu' });
ActivityPrive.belongsTo(Beneficiary, { foreignKey: 'id_beneficiaire', as: 'beneficiary' });
ActivityPrive.belongsTo(Volunteer, { foreignKey: 'id_benevole', as: 'volunteer' });

module.exports = ActivityPrive;
