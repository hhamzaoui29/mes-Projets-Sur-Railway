const express = require("express");
const router = express.Router();
const lettreController  = require("../controllers/lettreController");
const lettreService = require("../service/lettreService");

router.get("/", lettreController.renderHomePage);

router.get("/formCreate", lettreController.formCreateLetter);
router.post("/create", lettreController.renderCreateLetter);

router.get("/:id", lettreController.renderShowLetter);

router.get("/:id/formUpdate", lettreController.formUpdateLetter);
router.post("/:id/update", lettreController.renderUpdateLetter);

router.post("/:id/delete", lettreController.deleteLetter);

router.get("/:id/generer", lettreService.generatePDF);

module.exports = router;
