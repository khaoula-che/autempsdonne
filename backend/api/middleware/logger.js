const morgan = require('morgan');

// Configuration de Morgan pour enregistrer les requêtes en 'dev' format
const logger = morgan('dev');

module.exports = logger;
