const express = require("express");
const router = express.Router();

const servicesController = require('../../controllers/admin/servicesController');
const {upload} = require ('../../utils/multerConfig');

// Liste
router.get('/',  servicesController.renderFormList);
router.get ('/show/:id/:titre', upload.single("icon"), servicesController.renderFormShow);

// Créer
router.get('/formCreate',  servicesController.renderFormCreate);
router.post('/create',upload.single("icon"),  servicesController.renderCreate);

// Modifier
router.get('/formUpdate/:id',  servicesController.renderFormUpdate);
router.post('/update/:id',upload.single("icon"),  servicesController.renderUpdate);

// Supprimer
router.post('/delete/:id',  servicesController.renderDelete);

module.exports = router
