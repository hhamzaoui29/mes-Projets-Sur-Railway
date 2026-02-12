const express = require('express');
const router  = express.Router();
const contactController = require('../../controllers/home/contactController');

// afficher le formulaire
router.get('/liste', contactController.renderFormList);


// traiter le formulaire
router.get('/', contactController.renderFormContact);
router.post('/create', contactController.renderCreate);

// Supprimer un message
router.post('/delete/:id', contactController.deleteData);
// Marquer comme lu
router.post('/lu/:id', contactController.marquerCommeLu);

module.exports = router;
