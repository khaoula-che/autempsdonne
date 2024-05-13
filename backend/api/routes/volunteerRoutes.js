const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getMaraudeForVolunteer,
  getActiviteForLoggedInUser,
  getActivitePriveForLoggedInUser,
  displayAvailability,
  updateAvailability,
  deleteAvailability,
  createAvailability,
  deleteAccount,
  exportUserInfoAsPDF,
  getFormationsForVolunteer,
  deleteRegistrationFormation,
  checkRegistrationStatusFormation,
  addRegistrationFormation,
  getEventsAllForVolunteer, 
  getEventsPvForVolunteer,
  getEventsForVolunteer,
  registerVolunteer,
  deleteRegistration ,
  checkRegistrationStatus, 
  loginVolunteer,getUserInfo,
  addRegistration,
  getUserInfoapp,
  loginVolunteerapp,
  updateDenreesWithQRCodeInfo }
   = require('../controllers/volunteerController');
const authentication = require('../middleware/authentication');
const cors = require('cors');

const storage = multer.memoryStorage(); 

const upload = multer({ storage: storage }).fields([
  { name: 'casier_judiciaire', maxCount: 1 },
  { name: 'justificatif_permis', maxCount: 1 }
]);

router.use(cors({
  origin: [' https://au-temps-donne-frontend.onrender.com/', 'http://10.0.2.2:8000', 'http://10.0.2.3:8000'], // Ajoutez l'adresse de l'émulateur Android
  credentials: true // Allow credentials (cookies)
}));


router.put('/app/processQrCode', async (req, res) => {
    try {
        const qrCodeData = req.body.qrCodeData; 
        await updateDenreesWithQRCodeInfo(qrCodeData);
        res.status(200).send('Denrees updated successfully.');
    } catch (error) {
        console.error('Error processing QR code:', error);
        res.status(500).send('Failed to process QR code.');
    }
});
router.get('/app/userinfo', getUserInfoapp);
router.get('/app/activites_prives', getActivitePriveForLoggedInUser);
router.post('/app/login', loginVolunteerapp);


router.post('/registerVolunteer', (req, res, next) => {
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
}, registerVolunteer);
router.put('/volunteer', async (req, res) => {
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
})
router.get('/userinfo', getUserInfo);

router.post('/login', loginVolunteer);
router.post('/activites/registrations/:ID_event', addRegistration);

router.post('/formations/registrations/:id_formation', addRegistrationFormation);
router.get('/formations/registrations/:id_formation/:id_benevole',checkRegistrationStatusFormation);
router.delete('/formations/registrations/delete/:id_formation/:id_benevole',deleteRegistrationFormation);

router.get('/registrations/:eventId/:benevoleId',checkRegistrationStatus);
router.delete('/registrations/delete/:eventId/:benevoleId',deleteRegistration);
router.get('/activities/:benevoleId', getEventsForVolunteer);
router.get('/activities-prv/:benevoleId', getEventsPvForVolunteer);
router.get('/activites-prives', getActivitePriveForLoggedInUser);
router.get('/activites', getActiviteForLoggedInUser);
router.get('/maraudes', getMaraudeForVolunteer);

router.get('/activities-all/:benevoleId', getEventsAllForVolunteer);
router.get('/formations/:id_benevole', getFormationsForVolunteer);


router.get('/availability', displayAvailability);
router.post('/add-to-availability', createAvailability);
router.put('/updateAvailability/:id_disponibilite', updateAvailability);
router.delete('/deleteAvailability/:id_disponibilite', deleteAvailability);
router.get('/getpdf', exportUserInfoAsPDF);

router.put('/processQrCode', async (req, res) => {
  try {
      const qrCodeData = req.body.qrCodeData;
      await updateDenreesWithQRCodeInfo(qrCodeData);
      res.status(200).send('Denrees updated successfully.');
  } catch (error) {
      console.error('Error processing QR code:', error);
      res.status(500).send('Failed to process QR code.');
  }
});
module.exports = router;
