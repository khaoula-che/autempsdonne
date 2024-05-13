const http = require('http');
const express = require('express');
const app = express();
const sequelize = require('./config/db');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const partenaireRoutes = require('./routes/partenaireRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const eventRoutes = require('./routes/eventRoutes');
const entrepotsRoutes = require('./routes/entrepotsRoutes');

const cookieParser = require('cookie-parser');
const path = require('path');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Use cookie-parser middleware
app.use(cookieParser());

// Middleware setup
app.use(bodyParser.json());

require('dotenv').config();

const cors = require('cors');
const corsOptions = {
  origin: ['https://au-temps-donne-frontend.onrender.com', 'https://au-temps-donne.onrender.com', 'http://10.0.2.2:8000', 'http://10.0.2.3:8000'],
  credentials: true,
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

const port = process.env.PORT || 8000;
const logger = require('./middleware/logger');

app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/admin', adminRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);
app.use('/api/partenaire', partenaireRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/entrepot', entrepotsRoutes);

app.get('/debug', (req, res) => {
  console.log('Request Headers - Cookie:', req.headers.cookie);
  console.log('Parsed Cookies:', req.cookies);
  res.send('Check the server console for cookie information.');
});

app.get('/api/data', (req, res) => {
  try {
      // your logic here
      res.json({ data: 'Here is your JSON data' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message
  });
});

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données établie avec succès.');
    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Serveur en écoute sur le port ${port}`);
    });
  })
  .catch(err => {
    console.error('Impossible de se connecter à la base de données:', err);
  });
