const express = require('express');
const router = express.Router();

const productController = require('../../controllers/admin/produitsController');

// Routes ADMIN (protégées plus tard)
router.get('/formCreate', productController.formCreate);     // Formulaire création
router.post('/create', productController.renderCreate);     // Création <--- CELLE-CI EST CRUCIALE

module.exports = router;