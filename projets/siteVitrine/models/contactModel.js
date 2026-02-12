

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
                                                nom: {
                                                        type: DataTypes.STRING,
                                                        allowNull: false
                                                      },
                                                email: {
                                                          type: DataTypes.STRING,
                                                          allowNull: false,
                                                          validate: { isEmail: true }
                                                        },
                                                telephone: {
                                                              type: DataTypes.STRING,
                                                              allowNull: true
                                                            },
                                                sujet: {
                                                          type: DataTypes.STRING,
                                                          allowNull: false
                                                        },
                                                message: {
                                                            type: DataTypes.TEXT,
                                                            allowNull: false
                                                          },
                                                lu: {
                                                      type: DataTypes.BOOLEAN,
                                                      defaultValue: false, // par défaut un nouveau message est "Non lu"
                                                    }
                                              });

module.exports = Contact;

