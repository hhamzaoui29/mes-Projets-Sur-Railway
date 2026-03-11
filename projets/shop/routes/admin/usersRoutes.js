/**
 * ROUTES CATÉGORIES
 */

const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/usersController');

// Routes pour les catégories (admin seulement pour l'instant)
router.get('/', usersController.index);
router.get('/formCreate', usersController.formCreate);
router.post('/create', usersController.renderCreate);

// Routes pour l'édition
router.get('/formUpdate/:id', usersController.formUpdate);
router.post('/update/:id', usersController.renderUpdate);

// Route pour la suppression
router.post('/delete/:id', usersController.renderDelete);

module.exports = router;