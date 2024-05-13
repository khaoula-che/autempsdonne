const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('administrateurs', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: Sequelize.STRING, allowNull: false }, 
  prenom: { type: Sequelize.STRING, allowNull: false }, 
  email: { type: Sequelize.STRING, allowNull: false }, 
  mot_de_passe: { type: Sequelize.STRING, allowNull: false } 
}, 
 { 
  timestamps: false,
  hooks: {
    beforeCreate: async (admin, options) => {
      const existingAdmin = await Admin.findOne({ where: { email: admin.email }});
      if (existingAdmin) {
        throw new Error('Un administrateur avec cet email existe déjà');
      }
    }
  }
});

module.exports = Admin;
