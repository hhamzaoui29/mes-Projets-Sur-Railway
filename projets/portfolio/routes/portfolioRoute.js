const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// Routes
router.get('/', portfolioController.formPortfolio);


module.exports = router;


