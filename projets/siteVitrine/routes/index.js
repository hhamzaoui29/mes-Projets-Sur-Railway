const express = require("express");
const router = express.Router();




// ============================================================================================================================================================================= //
//                                                          Import des routes

// ============================================================================================================================================================================= //
//Admin
const loginRoutes       = require("./admin/loginRoutes");
const usersRoutes       = require("./admin/usersRoutes");
const servicesRoutes    = require('./admin/servicesRoutes');
const galerieRoutes     = require('./admin/galerieRoutes');
const carousselRoutes   = require('./admin/carousselRoutes');
const renderMessageNonLu = require('../middlweares/messagesNonLu');
//Home
const homeRoutes        = require("./home/homeRoutes");
const contactRoutes     = require("./home/contactRoutes");


// ============================================================================================================================================================================= //
//                                                          Définition des routes                                                                             //
// ============================================================================================================================================================================= //
router.use('/admin', renderMessageNonLu);
router.use('/vitrine', homeRoutes);
router.use('/login', loginRoutes);
router.use('/users', usersRoutes);
router.use('/services', servicesRoutes);
router.use('/galeries', galerieRoutes);
router.use('/caroussels', carousselRoutes);
router.use('/contact', contactRoutes);


module.exports = router;
