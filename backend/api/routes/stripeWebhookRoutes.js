const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

// Endpoint pour les webhooks Stripe
router.post('/stripe-webhook', stripeWebhookController.handleStripeWebhook);

module.exports = router;


