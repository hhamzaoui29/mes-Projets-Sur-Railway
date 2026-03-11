/**
 * ROUTES DASHBOARD
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

// Route du dashboard
router.get('/', dashboardController.index);

module.exports = router;