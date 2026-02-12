// models/contactModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
                                          id: {
                                             type: DataTypes.INTEGER,
                                             autoIncrement: true,    // ← super important
                                             primaryKey: true
                                          },
                                          nom: {
                                             type: DataTypes.STRING,
                                             allowNull: false
                                           },
                                          email: {
                                             type: DataTypes.STRING,
                                             allowNull: false,
                                             unique: true
                                          },
                                          password: {  // on stockera le mot de passe hashé
                                             type: DataTypes.STRING,
                                             allowNull: false
                                          },
                                          role: { // optionnel si tu veux plusieurs types d’utilisateurs
                                             type: DataTypes.ENUM('admin', 'editor'),
                                             defaultValue: 'admin'
                                          }
                                       });

module.exports = User;

