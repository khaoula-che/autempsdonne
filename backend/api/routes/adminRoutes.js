const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authentication = require('../middleware/authentication');
const cors = require('cors');

router.use(cors({
    origin: [' https://au-temps-donne-frontend.onrender.com/', 'https://au-temps-donne.onrender.com','http://10.0.2.2:8000', 'http://10.0.2.3:8000'], // Ajoutez l'adresse de l'émulateur Android
    credentials: true // Allow credentials (cookies)
  }));
// Admin routes
router.post('/add', adminController.createAdmin);
router.post('/addAdmin', adminController.addAdmin);
router.get('/', adminController.getAdmin);
router.get('/admins', adminController.getAllAdmins);
router.post('/login', adminController.loginAdmin);
router.delete('/delete', adminController.deleteAdmin);
router.get('/userinfo', adminController.getUserInfo);

router.delete('/volunteers/delete', adminController.deleteVolunteer);
router.get('/infosUser/benevole/:email', adminController.getVolunteer);
router.get('/volunteers', adminController.getAllVolunteers);
router.get('/volunteers/latest-volunteers', adminController.getLatestVolunteers);
router.get('/volunteersAdmin', adminController.getAllNonAdminVolunteers);
router.post('/addVolunteerToAdmin', adminController.addVolunteerToAdmins);
router.post('/volunteers/update-status', adminController.updateVolunteerStatus);
router.get('/all', adminController.getAllVolunteersAndBeneficiaries);
router.get('/all/latest', adminController.getAllLatestVolunteersAndBeneficiaries);

router.post('/addVolunteer', adminController.addVolunteer);

router.get('/infosUser/beneficiaire/:email', adminController.getBeneficiary);
router.get('/beneficiaires', adminController.getAllBeneficiaires);
router.post('/beneficiaires/update-status', adminController.updateBeneficiaryStatus);
router.delete('/beneficiaires/delete', adminController.deleteBeneficiary);
router.post('/addBeneficiary', adminController.addBeneficiary);


router.post('/blogs/create', adminController.createBlog);
router.get('/blogs', adminController.getAllBlogs);

router.post('/addPartenaire', adminController.addPartenaire);
router.delete('/Partenaires/delete', adminController.deletePartenaire);
router.get('/Partenaires', adminController.getAllPartenaires);
router.get('/services', adminController.getAllServices);

router.get('/adresses', adminController.getAllAdresses);

router.post('/logout', (req, res) => {
    res.clearCookie('access_token', { path: '/', httpOnly: true, secure: true }); 
    res.status(200).json({ message: 'Logout successful' });
});

router.put('/admin', async (req, res) => {
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

const itineraryController = require('../controllers/itineraryController');
router.post('/generate-itinerary', itineraryController.generateItinerary);
router.get('/entrepots', adminController.getAllEntrepots);
router.get('/partner/:partnerId/lieu', adminController.getLieuByPartner);
module.exports = router;
