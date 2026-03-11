const express = require("express");
const router = express.Router();

// ============================================================================================= //
//                                  Import des routes                                            //
// ============================================================================================= //

const dashboardRoutes  = require("./admin/dashboardRoutes");
const categoriesRoutes = require("./admin/categoriesRoutes");
const rolesRoutes      = require("./admin/rolesRoutes");
const usersRoutes      = require("./admin/usersRoutes");
const produitsRoutes   = require("./admin/produitsRoutes");
//const sRoutes = require("./sRoutes");

// ============================================================================================= //
//                              Définition des routes                                            //
// ============================================================================================= //
router.use('/dashboard', dashboardRoutes);
router.use('/categories',categoriesRoutes);
router.use('/roles',     rolesRoutes);
router.use('/users',     usersRoutes);
router.use('/produits',  produitsRoutes);
//router.use('/s',sRoutes);

module.exports = router;