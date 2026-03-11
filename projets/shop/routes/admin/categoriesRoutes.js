/**
 * ROUTES CATÉGORIES
 */

const express = require('express');
const router = express.Router();
const categoriesController = require('../../controllers/admin/categoriesController');

// Routes pour les catégories (admin seulement pour l'instant)
router.get('/', categoriesController.index);
router.get('/formCreate', categoriesController.formCreate);
router.post('/create', categoriesController.renderCreate);

// Routes pour l'édition
router.get('/formUpdate/:id', categoriesController.formUpdate);
router.post('/update/:id', categoriesController.renderUpdate);

// Route pour la suppression
router.post('/delete/:id', categoriesController.renderDelete);
// Ajouter edit, update, delete plus tard

module.exports = router;