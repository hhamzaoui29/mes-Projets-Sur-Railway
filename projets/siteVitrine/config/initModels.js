// config/initModels.js
const sequelize = require('./db');

// Import des modèles
const User       = require('../models/usesModel');
const Galerie    = require('../models/galerieModel');
const Caroussel  = require('../models/carousselModel');
const Services   = require('../models/servicesModel');
const Contact    = require('../models/contactModel');

// Relations 1:N Service → Galerie
Services.hasMany(Galerie, { foreignKey: 'serviceId', as: 'galeries' });
Galerie.belongsTo(Services, { foreignKey: 'serviceId', as: 'services' });

// Relations 1:N Galerie → Caroussel
Galerie.hasMany(Caroussel, { foreignKey: 'galerieId', as: 'images' });
Caroussel.belongsTo(Galerie, { foreignKey: 'galerieId', as: 'galerie' });

// Export de tous les modèles
module.exports = { User, Galerie, Caroussel, Services, Contact };

