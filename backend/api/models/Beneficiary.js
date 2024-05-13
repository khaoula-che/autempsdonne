const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Beneficiary = sequelize.define('beneficiaires', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: Sequelize.STRING, allowNull: false },
  prenom: { type: Sequelize.STRING, allowNull: false },
  date_de_naissance: { type: Sequelize.DATE },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  mot_de_passe: { type: Sequelize.STRING, allowNull: false },
  telephone: { type: Sequelize.STRING(15) },
  adresse: { type: Sequelize.STRING },
  ville: { type: Sequelize.STRING },
  code_postal: { type: Sequelize.STRING(5) },
  date_adhesion: { type: Sequelize.DATE },
  statut_validation: { type: Sequelize.STRING(20) },
  genre: { type: Sequelize.STRING },
  besoin: { type: Sequelize.STRING },
  avis_impot: {
  type: Sequelize.TEXT
},
  date_inscription: { type: Sequelize.DATE }

}, 
{
  timestamps: false 
});

module.exports = Beneficiary;
