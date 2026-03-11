// routes/questionnaireRoutes.js
const express = require('express');
const router = express.Router();
const QuestionnaireController = require('../controllers/questionnaireControllers');
const ReponseController       = require('../controllers/reponseControllers');
const AfficahgeController     = require('../controllers/affichageControllers');

const questionnaire = new QuestionnaireController();
const reponse       = new ReponseController();
const affichage     = new AfficahgeController();

/* 
   POURQUOI .bind(controller) EST NÉCESSAIRE ICI :
   ---------------------------------------------
   Les méthodes du contrôleur (index, formCreate, etc.) utilisent 'this' 
   pour accéder aux propriétés initialisées dans le constructeur 
   (connexion DB, modèles, etc.).
   
   Quand on passe ces méthodes comme callbacks à Express, sans .bind() 
   le contexte 'this' serait perdu au moment de l'appel de la route.
   
   .bind(controller) garantit que 'this' à l'intérieur des méthodes 
   fait toujours référence à notre instance de contrôleur, préservant 
   ainsi l'accès à toutes ses propriétés et méthodes.
*/


// Route pour page Principale
router.get('/', questionnaire.index.bind(questionnaire));


// Routes pour les questionnaires
router.get('/formCreate', questionnaire.formCreate.bind(questionnaire));
router.post('/create', questionnaire.renderCreate.bind(questionnaire));
router.get('/formSelect', questionnaire.formSelect.bind(questionnaire));



// Routes pour les Reponses
router.get('/formFill/:nomFichier', reponse.formFill.bind(reponse));    
router.post('/save', reponse.save.bind(reponse)); 
router.get('/formConfirme/:id', reponse.formulaireConfirmation.bind(reponse));


// Routes pour l'affichage et téléchargement PDF
router.get('/views', affichage.listFormulaires.bind(affichage));
router.get('/view/:id', affichage.viewReponses.bind(affichage));
router.get('/download/:id/:format', affichage.downloadPdf.bind(affichage));

module.exports = router;