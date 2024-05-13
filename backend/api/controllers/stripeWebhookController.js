// Importer les dépendances nécessaires
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // STRIPE_SECRET_KEY est votre clé secrète Stripe
const Donation = require('../models/Donation')

const stripeWebhookController = {
    // Gérer les webhooks Stripe
    handleStripeWebhook: async (req, res) => {
      const payload = req.body;
      
      // Vérifier la signature de l'événement Stripe
      const sig = req.headers['stripe-signature'];
      let event;
  
      try {
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET); // STRIPE_WEBHOOK_SECRET est votre secret de webhook Stripe
      } catch (err) {
        console.error('Erreur de signature de webhook Stripe :', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      // Gérer différents types d'événements Stripe
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Extraire les informations pertinentes du paiement réussi
          const montant = paymentIntent.amount;
          const devise = paymentIntent.currency;
          const email = paymentIntent.receipt_email;
          const id_paiement = paymentIntent.id;
          
          // Enregistrez les informations dans votre base de données
          try {
            const donation = await Donation.create({
              montant,
              devise,
              email,
              id_paiement,
              statut: 'reussi' // Vous pouvez définir le statut du paiement ici
            });
            console.log('Donation enregistrée :', donation);
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la donation :', error);
            // Traitez l'erreur selon vos besoins
          }
          break;
        case 'payment_intent.payment_failed':
          const paymentFailedIntent = event.data.object;
          // Traiter l'échec de paiement (envoyer des notifications, gérer les tentatives de paiement ultérieures, etc.)
          console.log('Échec de paiement :', paymentFailedIntent);
          break;
        // Ajoutez d'autres cas pour d'autres types d'événements Stripe que vous souhaitez gérer
        default:
          console.warn(`Événement Stripe non géré de type : ${event.type}`);
      }
  
      // Répondre à l'événement Stripe avec un code de statut 200
      res.json({ received: true });
    }
  };
  
  module.exports = stripeWebhookController;
