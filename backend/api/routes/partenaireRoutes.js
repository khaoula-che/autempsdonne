const express = require('express');
const router = express.Router();
const { registerPartenaire,loginPartenaire, getPartenaireInfo, getProductsForPartenaire, addProductForPartenaire, deleteProductForPartenaire, updateProductForPartenaire, updateAccount, deleteAccount, getAllPartenaireInfo, changePassword } = require('../controllers/partenaireController');
const { createProblem } = require('../controllers/problemController');
const jwt = require('jsonwebtoken');

const { generateAnnualReportController } = require('../controllers/partenaireController');
const Lieu = require('../models/Lieu');

const cors = require('cors');

router.use(cors({
    origin: [' https://au-temps-donne-frontend.onrender.com/', 'https://au-temps-donne.onrender.com','http://10.0.2.2:8000', 'http://10.0.2.3:8000'], // Ajoutez l'adresse de l'émulateur Android
    credentials: true // Allow credentials (cookies)
  }));
// Route to fetch Lieu data based on id_adresse
router.get('/lieux/:id_adresse', async (req, res) => {
    try {
        const id_adresse = req.params.id_adresse;
        const lieu = await Lieu.findOne({ where: { id_lieu: id_adresse } });
        if (!lieu) {
            return res.status(404).json({ message: 'Lieu not found' });
        }
        res.status(200).json(lieu);
    } catch (error) {
        console.error('Error fetching Lieu data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/change-password', changePassword);
// Route to generate the annual report PDF
router.get('/annual-report/:year', generateAnnualReportController);
router.get('/getuserinfos', getAllPartenaireInfo);
router.put('/update', updateAccount);
router.delete('/delete',deleteAccount);
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/register', registerPartenaire);
router.post('/problems', createProblem);
router.post('/login', loginPartenaire);

function extractID_Commercant(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ error: 'No access token found' });
    }
    try {
        const decoded = jwt.verify(token, 'your_secret_key_here');
        if (!decoded || !decoded.ID_commercant) {
            throw new Error('Invalid access token');
        }
        req.ID_Commercant = decoded.ID_Commercant; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid access token' });
    }
}

router.get('/allProducts', getProductsForPartenaire);
router.post('/addProduct', addProductForPartenaire, getPartenaireInfo);
router.delete('/denree/:idDenree/deleteProduct',  deleteProductForPartenaire,getPartenaireInfo);
router.put('/denree/:idDenree/updateProduct',  updateProductForPartenaire, getPartenaireInfo);

router.get('/getMe', getPartenaireInfo);

module.exports = router;
