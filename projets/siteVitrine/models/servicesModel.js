const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Galerie = require('./galerieModel'); 

const Service = sequelize.define('Service', {
                                                  id: {
                                                    type: DataTypes.INTEGER,
                                                    autoIncrement: true,
                                                    primaryKey: true
                                                  },
                                                  titre: {
                                                    type: DataTypes.STRING,
                                                    allowNull: false
                                                  },
                                                  description: {
                                                    type: DataTypes.TEXT,
                                                    allowNull: false
                                                  },
                                                  icon: {
                                                    type: DataTypes.STRING,
                                                    allowNull: true
                                                  }
                                              });

module.exports = Service;

