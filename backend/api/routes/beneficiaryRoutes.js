const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage }).fields([
  { name: 'avis_impot', maxCount: 1 },
]);

const { 
    addDemandeServicePrive,
    getEventsPvForBeneficiary,
    getEventsAllForBeneficiary,
    deleteRegistration,
    checkRegistrationStatus,
    addRegistration,
    registerBeneficiary, 
    login, 
    getUserInfo, 
    updateBeneficiary, 
    getActivitePriveForLoggedInUser, 
    getEventsForBeneficiary
} = require('../controllers/beneficiaryController');

const ImageProfile = require('../models/ImageProfile');
const Blog = require('../models/Blog');
const authentication = require('../middleware/authentication');

const cors = require('cors');

router.use(cors({
    origin: [' https://au-temps-donne-frontend.onrender.com/', 'https://au-temps-donne.onrender.com','http://10.0.2.2:8000', 'http://10.0.2.3:8000'], // Ajoutez l'adresse de l'émulateur Android
    credentials: true // Allow credentials (cookies)
  }));
router.post('/registerBeneficiary', (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer Error:', err);
        return res.status(400).json({ error: 'Une erreur s\'est produite lors du téléversement du fichier' });
      } else if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
      }
  
      next();
    });
  }, registerBeneficiary);

router.post('/login', login);
router.get('/userinfo', getUserInfo);
router.get('/activites_prives', getActivitePriveForLoggedInUser);
router.put('/beneficiary', async (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({ error: 'Access token not provided' });
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const updatedBeneficiary = await updateBeneficiary(decodedToken.id, req.body);
        res.status(200).json(updatedBeneficiary);
    } catch (error) {
        console.error('Error updating beneficiary:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Logout successful' });
});

router.get('/protected', authentication, async (req, res) => {
    try {
        const profileImage = await ImageProfile.findOne({ where: { ID_Beneficiaire: req.user.id } });
        if (!profileImage) {
            return res.status(404).json({ error: 'Profile image not found' });
        }
        res.json({ profileImagePath: profileImage.image_path });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/articles', async (req, res) => {
    try {
        const articles = await Blog.findAll();
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Event 

router.post('/activites/registrations/:ID_event', addRegistration);
router.get('/activites/registrations/:eventId/:beneficiareId',checkRegistrationStatus);
router.delete('/activites/registrations/delete/:eventId/:beneficiareId',deleteRegistration);

router.get('/activities-all/:beneficiareId', getEventsAllForBeneficiary);
router.get('/activities-prv/:beneficiareId', getEventsPvForBeneficiary);
router.get('/activities/:beneficiareId', getEventsForBeneficiary);


router.post('/sendServiceRequest', addDemandeServicePrive);

module.exports = router;
