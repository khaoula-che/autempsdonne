const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Admin = require('./Admin');

const Blog = sequelize.define('blog', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    titre: { type: Sequelize.STRING, allowNull: false },
    contenu: { type: Sequelize.STRING },
    auteur: { type: Sequelize.INTEGER },
    date_creation: { type: Sequelize.DATE },
    image: { type: Sequelize.STRING }
  
  }, 
  {
    tableName: 'blog', 

    timestamps: false 
  });
  Blog.belongsTo(Admin, { foreignKey: 'auteur' });


  module.exports = Blog;