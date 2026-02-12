const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Table Galerie (réalisation principale)
const Galerie = sequelize.define('Galerie', {
                                              id: {
                                                type: DataTypes.INTEGER,
                                                autoIncrement: true,
                                                primaryKey: true
                                              },
                                              titre: {
                                                type: DataTypes.STRING,
                                                allowNull: false
                                              },
                                              categorie: {
                                                type: DataTypes.STRING,
                                                allowNull: false
                                              },
                                              image: {
                                                type: DataTypes.STRING, // si tu veux garder une image principale
                                                allowNull: true
                                              },
                                              serviceId: { // clé étrangère vers Service
                                                type: DataTypes.INTEGER,
                                                references: {
                                                  model: 'Services',
                                                  key: 'id'
                                                },
                                                onDelete: 'CASCADE',
                                                allowNull: false
                                              }
                                            });




module.exports = Galerie ;
