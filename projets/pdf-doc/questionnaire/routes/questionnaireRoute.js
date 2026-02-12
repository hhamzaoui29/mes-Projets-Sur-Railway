// ======================
// questionnaireRoute.js
// ======================
// 1️⃣ IMPORTS
// ======================

const express = require("express");
const router = express.Router();

const questionnaireController = require("../controllers/questionnaireController");


// ======================
// 2️⃣ ROUTES
// ======================

router.get("/", questionnaireController.renderHomePage);
router.post("/start", questionnaireController.renderQuestionnairePage);
router.post("/submit", questionnaireController.submitQuestionnaire);
router.post("/download", questionnaireController.downloadDocument);





// ======================
// 3️⃣ EXPORT DU ROUTER
// ======================

module.exports = router;



