const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin/loginController');

// Page login
router.get('/', adminController.formLogin);

// Traitement login
router.post('/connexion', adminController.login);

// Dashboard (protégé)
router.get('/dashboard', adminController.ensureAuth, adminController.formDashboard);

// Déconnexion
router.get('/logout', adminController.logout);

module.exports = router;