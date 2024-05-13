const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Volunteer = require('./Volunteer'); // Import the Benevole model

const Disponibilite = sequelize.define('disponibilite', {
    id_disponibilite: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_benevole: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {        
            model: Volunteer,
            key: 'id' 
        }
    },
    jour: {
        type: Sequelize.DATE,
        allowNull: false
    },
    heure_debut: {
        type: Sequelize.TIME,
        allowNull: false
    },
    heure_fin: {
        type: Sequelize.TIME,
        allowNull: false
    }
}, {
    tableName: 'disponibilite',
    timestamps: false 
});

Disponibilite.belongsTo(Volunteer, { foreignKey: 'id_benevole', as: 'benevole' });

module.exports = Disponibilite;
