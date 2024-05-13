const sequelize = require('../config/db');

const Lieu = require('./Lieu'); // Importation directe si Lieu est déjà une instance
const Activity = require('./Activity'); // Idem pour Activity

const models = {
  Lieu,
  Activity
};

// Assurez-vous que toutes les associations sont définies ici
models.Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'lieu' });

// Exportation des modèles pour utilisation ailleurs dans l'application
module.exports = models;
