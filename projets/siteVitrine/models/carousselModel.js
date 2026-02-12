const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


// Table Caroussel (plusieurs images liées à une galerie)
const Caroussel = sequelize.define('Caroussel', {
                                                    id: {
                                                      type: DataTypes.INTEGER,
                                                      autoIncrement: true,
                                                      primaryKey: true
                                                    },
                                                    image_path: {
                                                      type: DataTypes.STRING,
                                                      allowNull: false
                                                    },
                                                    galerieId: { // clé étrangère vers Galerie
                                                      type: DataTypes.INTEGER,
                                                      references: {
                                                        model: 'Galeries', // Sequelize met le nom de table au pluriel par défaut
                                                        key: 'id'
                                                      },
                                                      onDelete: 'CASCADE',
                                                      allowNull: false
                                                    }
                                                  });

module.exports = Caroussel ;
