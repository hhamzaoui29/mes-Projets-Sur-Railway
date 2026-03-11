const session = require('express-session');
const dotenv = require('dotenv');

// Charger les variables d'environnement à partir d'un fichier .env
dotenv.config();

// Exporter la configuration de session
module.exports = session({
  name: process.env.SESSION_NAME,
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {
            maxAge: 7*24*60*60*1000, // Durée de la session : 7 JOURS
            secure: false, // À définir sur true en production si vous utilisez HTTPS
          },
  //store: // Définir un magasin de session si nécessaire, par exemple, pour stocker les sessions dans une base de données
});

