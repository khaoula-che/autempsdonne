const express = require('express');
const router = express.Router();
const upload = require('../multerConfig');
const usersController = require('../controllers/adminController');

const { registerBeneficiary } = require('../controllers/usersController');  

router.post('/registerBeneficiary',upload, registerBeneficiary);

module.exports = router;
