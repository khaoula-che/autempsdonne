const jwt = require('jsonwebtoken');
const Beneficiary = require('../models/Volunteer'); // Import your Beneficiary model
const ImageProfile = require('../models/ImageProfile'); 
module.exports = async function (req, res, next) {
    const token = req.cookies.access_token; // Get the token from cookies instead of the Authorization header
    if (!token) {
        console.log('Access denied. No token provided.');
        return res.status(401).json({ error: 'Access denied. No token provided.' }); // Send a JSON response with error message
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded token:', decoded);

        // Check if the user's email is in the database
        const beneficiary = await Beneficiary.findOne({ where: { email: decoded.email } });
        if (!beneficiary) {
            console.log('User not found.');
            return res.status(401).json({ error: 'Access denied. User not found.' });
        }

        console.log('User authenticated:', beneficiary);

        // Fetch the image path from the database based on the user's ID
        let profileImage = null;
        if (beneficiary.userType === 'beneficiary') {
            profileImage = await ImageProfile.findOne({
                where: { ID_Beneficiaire: beneficiary.id }
            });
        } else if (beneficiary.userType === 'volunteer') {
            // Assuming the Volunteer model has a profileImagePath field
            profileImage = await Volunteer.findOne({
                where: { id: beneficiary.id }
            });
        }

        console.log('Profile image found:', profileImage);

        // Attach the profile image path to the request object
        req.user = decoded;
        req.profileImagePath = profileImage ? profileImage.image_path : null;

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(400).json({ error: 'Invalid token.' }); // Send a JSON response with error message
    }
};
