const Sequelize = require('sequelize');
const sequelize = require('../config/db');


const Volunteer = sequelize.define('benevoles', {
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
  message_candidature: { type: Sequelize.STRING },
  date_inscription: { type: Sequelize.DATE },
  permis_conduire: {type: Sequelize.STRING(3) },
  casier_judiciaire:{ type: Sequelize.TEXT },
  justificatif_permis:  { type: Sequelize.TEXT },
  qualites:  { type: Sequelize.STRING },
  competences: { type: Sequelize.STRING },
  langues : { type: Sequelize.STRING },
  token_activation: { type: Sequelize.STRING }

}, 
{
  timestamps: false 
});

module.exports = Volunteer;
