const jwt = require('jsonwebtoken');
const Beneficiary = require('../models/Beneficiary');
const ImageProfile = require('../models/ImageProfile');

module.exports = async function (req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        console.log('Access denied. No token provided.');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
};