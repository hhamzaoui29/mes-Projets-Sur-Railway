// Fichier: test-model.js
const QuestionnaireModel = require('../models/crudModel');

async function testeModel() {
                                const model = new QuestionnaireModel();
                                
                                 const contenu = { "1/- Titre de la section": [
                                                            "Question 1",
                                                            "Question 2",
                                                            "Question 3"
                                                        ],
                                                        "2/- Autre section": [
                                                            "Question A",
                                                            "Question B"
                                                        ]
                                                    };
                                const creation = await model.createFile('test-model.json', contenu);
                                console.log('Résultat création:', creation);
                            }
testeModel();