const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const carousselController = require("../../controllers/admin/carousselController");


router.get('/:galerieId', carousselController.renderFormList);

//Ajouter Une Image
router.post("/add", upload.single("image"), carousselController.addImage);

// Modifier Une Image
//router.post('/update/:id', upload.single("image"), carousselController.updateImage);


// Supprimer une image
router.post("/delete/:id", carousselController.deleteImage);



module.exports = router;
