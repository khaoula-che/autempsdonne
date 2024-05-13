// Fichier : multerConfig.js
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage }).fields([
    { name: 'justificatif_permis', maxCount: 1 },
    { name: 'casier_judiciaire', maxCount: 1 },
    { name: 'avis_impot', maxCount: 1 },

]);

module.exports = upload;
