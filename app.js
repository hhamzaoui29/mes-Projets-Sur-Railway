// ====================================================================================================================================================================================================//
//                                                                             🌐 Importations                                                                                                         //
// ====================================================================================================================================================================================================//

const express = require("express");
const path = require("path");
const http = require('http');
const app = express();

const session = require("express-session");

require("dotenv").config(); 
const sessionConfig = require('./sessionConfig');

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;



// ====================================================================================================================================================================================================//
//                                                                               ⚙️ Configuration de base                                                                                               //
// ====================================================================================================================================================================================================//

// Définir le moteur de template
app.set("view engine", "ejs");

// 🧩 Définir les dossiers de vues à rechercher
app.set("views", [
                    path.join(__dirname, "views"),               
                    path.join(__dirname, "projets" ),
                    path.join(__dirname, "projets/pdf-doc/questionnaire/views"),
                    path.join(__dirname, "projets/pdf-doc/facture/views")     
                  ]);

// ====================================================================================================================================================================================================//
//                                                                                🎨 Fichiers statiques                                                                                                //
// ====================================================================================================================================================================================================//

// Dossier public à la racine (CSS/JS communs)
app.use(express.static(path.join(__dirname, "public")));

// Dossier public spécifique siteVitrine, quiz et portfolio

app.use('/portfolio',     express.static(path.join(__dirname, 'projets/portfolio/public')));
app.use('/siteVitrine',   express.static(path.join(__dirname, 'projets/siteVitrine/public')));
app.use('/composants',    express.static(path.join(__dirname, 'projets/composants/public')));
app.use('/questionnaire', express.static(path.join(__dirname, 'projets/pdf-doc/questionnaire/public')));
app.use('/facture',       express.static(path.join(__dirname, 'projets/pdf-doc/facture/public')));


console.log("Dossier racine :", __dirname);


// ====================================================================================================================================================================================================//
//                                                                              🧱 Middlewares globaux                                                                                                 //
// ====================================================================================================================================================================================================//

// Permet de lire les données envoyées via les formulaires
app.use(express.urlencoded({ extended: true })); 

// Middleware pour parser les formulaires
app.use(express.json());  

// Middleware logger (affiche les requêtes dans la console)
app.use((req, res, next) => {
                              console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
                              next();
                            });

// Middleware pour les variables globales accessibles dans EJS
app.use((req, res, next) => {
                              res.locals.siteTitle = "Mon Portefeuille de Développeur";
                              res.locals.currentYear = new Date().getFullYear();
                              res.locals.baseUrl = req.protocol + "://" + req.get("host");
                              next();
                            });

app.use((req, res, next) => {
                              res.locals.baseUrl = req.protocol + "://" + req.get("host");
                              next();
                          });

// ====================================================================================================================================================================================================//
//                                                                              🧠 Configuration de session                                                                                            //
// ====================================================================================================================================================================================================//

app.use(sessionConfig);  


app.use((req, res, next) => {
                              res.locals.session = req.session; 
                              next();
                            });
                            
// ====================================================================================================================================================================================================//
//                                                                              🚦 Importation des routes                                                                                              //
// ====================================================================================================================================================================================================//


const portfolioRoutes  = require("./projets/portfolio/routes");
const siteRoute        = require("./projets/siteVitrine/routes");
const composantsRoute  = require("./projets/composants/routes");
const questionnaireRoutes = require("./projets/pdf-doc/questionnaire/routes/questionnaireRoute");
const factureRoutes       = require("./projets/pdf-doc/facture/routes/facturesRoutes");

// Brancher les modules de routes
app.use("/", portfolioRoutes);
app.use("/site", siteRoute);
app.use('/composants', composantsRoute);
app.use("/q", questionnaireRoutes);
app.use("/f", factureRoutes);


// ====================================================================================================================================================================================================//
//                                                                               ❌ Middleware 404 & 500                                                                                                  //
// ====================================================================================================================================================================================================//
// Page 404
app.use((req, res) => {
                          res.status(404).render("errors/404", { title: "Page introuvable" });
                      });

// Erreur serveur (500)
app.use((err, req, res, next) => {
                                    console.error("Erreur serveur :", err.stack);
                                    res.status(500).render('errors/500', { title: 'Erreur interne du serveur' });
                                 });

// ====================================================================================================================================================================================================//
//                                                                              🚀 Lancement du serveur                                                                                                //
// ====================================================================================================================================================================================================//



server.listen(PORT, () => {

                             console.log(`Serveur en cours d'exécution sur le port N° :${PORT}`);
                          });
