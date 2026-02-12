const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/home/homeController');
const {upload} = require ('../../utils/multerConfig');

router.get('/', homeController.formPageAceuil);
router.get('/services', homeController.formPageServices);
router.get('/detailService/:id', homeController.formPageServiceDetail);

router.get('/realisations', homeController.formPageRealisations);
router.get('/caroussel/:id', homeController.formCarousel);

module.exports = router;
