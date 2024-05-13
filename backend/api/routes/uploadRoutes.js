// routes/uploadRoute.js
const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../uploads/') 
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('monFichier'), uploadController.handleFileUpload);

module.exports = router;
