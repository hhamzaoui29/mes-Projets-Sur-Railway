const express = require('express');
const composantsController = require('../controllers/composantsController');

const router = express.Router();

// Routes

router.get('/', composantsController.renderCvForm);
router.get('/horloge',composantsController.renderHorlogeForm )


module.exports = router;