const express = require("express");
const router = express.Router();
const galerieController = require('../../controllers/admin/galerieController');
const { upload } = require('../../utils/multerConfig');

// Liste
router.get('/', galerieController.renderFormList);

// Créer
router.get('/formCreate', galerieController.renderFormCreate);
// upload.single pour simple, upload.array("images", 10) pour multi
router.post('/create', upload.array("image", 10), galerieController.renderCreate);

// Modifier
router.get('/formUpdate/:id', galerieController.renderFormUpdate);
router.post('/update/:id', upload.single("image"), galerieController.renderUpdate);

// Supprimer
router.post('/delete/:id', galerieController.renderDelete);

router.get('/caroussel/:id', galerieController.renderGalerieCarousel);


module.exports = router;
