
const { Sequelize } = require('sequelize');

// SQLite stocké dans un fichier local
const sequelize = new Sequelize({
                                    dialect: 'sqlite',
                                    storage: './site.db'
                                });

module.exports = sequelize;
