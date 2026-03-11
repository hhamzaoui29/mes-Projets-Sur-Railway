// Fichier: test-DataBase.js
const QuestionnaireDataBase = require('../models/dataBase');

async function testeDatabase() {
                                const DataBase = new QuestionnaireDataBase();
                                
                                console.log('1️⃣ Test: ensureDataDir');
                                await DataBase.ensureDataDir();

                                /*-----------------------------------*/
                                console.log('2️⃣ Test: save');
                                const testData = {
                                                    "section 1": ["question 1", "question 2"]
                                                 };
                                 await DataBase.save('testeDatabase.json', testData);

                                /*---------------------------------*/
                                console.log('3️⃣ Test: read');
                                const dataR = await DataBase.read('testDatabase.json');
                                console.log('Données lues:', dataR);

                                /*---------------------------------*/
                                console.log('3️⃣ Test: listAll');
                                const dataL = await DataBase.listAll('testeDatabase.json');
                                console.log('Données lues:', dataL);
                                
                                
                            }

testeDatabase();