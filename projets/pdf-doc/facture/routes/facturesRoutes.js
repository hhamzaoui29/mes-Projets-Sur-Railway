const express = require("express");
const router = express.Router();

const factureController = require("../controllers/facturesController");

router.get("/test", factureController.afficherFactures);
    
/******************************************************************
 * Route : liste des factures
 ******************************************************************/
router.get("/", factureController.afficherListeFactures);

/******************************************************************
 * Route : détail d’une facture
 ******************************************************************/
router.get("/factures/:id", factureController.afficherDetailFacture);

/******************************************************************
 * Route : détail d’une facture
 ******************************************************************/
router.get("/factures/:id/test", factureController.teste);

/*****************************************************************
// Route PDF pour visualisation
 ******************************************************************/
router.get("/factures/:id/view", factureController.visualiserPdf);

// ======================
// 3️⃣ EXPORT DU ROUTER
// ======================

module.exports = router;
