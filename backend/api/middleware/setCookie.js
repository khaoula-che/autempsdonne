// middleware/setCookie.js

const jwt = require('jsonwebtoken');

function setCookie(req, res, next) {
    // Assuming you have a user object available in req.user containing user information
    const user = req.user;

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token as a cookie in the response
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        sameSite: 'strict',
        // Add 'secure: true' if your app is served over HTTPS
        // secure: true
    });

    next();
}

module.exports = setCookie;
