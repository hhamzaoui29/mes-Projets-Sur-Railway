const express = require('express');
const router = express.Router();

const userController   = require('../../controllers/admin/usersController');
const ensureController = require('../../controllers/admin/loginController');

// Users CRUD
router.get('/',               ensureController.ensureAuth, ensureController.ensureLogin, userController.formList);
router.get('/formCreate',     ensureController.ensureAuth, ensureController.ensureLogin, userController.formCreate);
router.get('/formUpdate/:id', ensureController.ensureAuth, ensureController.ensureLogin, userController.formUpdate);

router.post('/create',           ensureController.ensureAuth, ensureController.ensureLogin, userController.create);
router.post('/update/:id',       ensureController.ensureAuth, ensureController.ensureLogin, userController.update);
router.post('/deleteData/:id',   ensureController.ensureAuth, ensureController.ensureLogin, userController.deleteData);

module.exports = router;


