const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate().then(() => {
  console.log('Connection successful.');
}).catch(err => {
  console.error('Connection failed:', err);
});

sequelize.sync({ force: false }).then(() => {
  console.log('Database synchronization successful.');
}).catch(err => {
  console.error('Database synchronization failed:', err);
});

module.exports = sequelize;
