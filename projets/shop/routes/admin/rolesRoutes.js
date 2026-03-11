/**
 * ROUTES CATÉGORIES
 */

const express = require('express');
const router = express.Router();
const rolesController = require('../../controllers/admin/rolesController');

// Routes pour les catégories (admin seulement pour l'instant)
router.get('/', rolesController.index);
router.get('/formCreate', rolesController.formCreate);
router.post('/create', rolesController.renderCreate);

// Routes pour l'édition
router.get('/formUpdate/:id', rolesController.formUpdate);
router.post('/update/:id', rolesController.renderUpdate);

// Route pour la suppression
router.post('/delete/:id', rolesController.renderDelete);
// Ajouter edit, update, delete plus tard

module.exports = router;