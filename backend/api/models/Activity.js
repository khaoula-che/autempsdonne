const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Lieu = require('./Lieu');
const Volunteer = require('./Volunteer');
const Beneficiary = require('./Beneficiary');

const Activity = sequelize.define('activites', {
    ID_Activite: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    description: { type: Sequelize.TEXT, allowNull: false },
    date_activite: { type: Sequelize.DATE, allowNull: false },
    heure_debut: { type: Sequelize.TIME, allowNull: false },
    heure_fin: { type: Sequelize.TIME },
    titre: { type: Sequelize.STRING(100), allowNull: false },
    id_lieu: { type: Sequelize.INTEGER },
    nom_service: { type: Sequelize.STRING(100) },
    nb_benevoles : { type: Sequelize.INTEGER },
    image :  { type: Sequelize.STRING(255) },
}, {
    timestamps: false
  });
  Activity.associate = function(models) {
    Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'lieu' });
};
Activity.associate = function(models) {
  Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'lieuA' });
};
Activity.associate = function(models) {
  Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'lieuB' });
};
  module.exports = Activity;