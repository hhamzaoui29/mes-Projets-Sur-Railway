const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Dossiers d'entrée et sortie
const inputFolder = '/home/heden/Images/raw-images/';
const outputFolder = './public/images/images-modifier';

// Crée le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputFolder)) {
                                      fs.mkdirSync(outputFolder, { recursive: true });
                                  }

// Récupérer les arguments passés au script
// Usage : node script.js largeur hauteur nomPhoto
const [,, widthArg, heightArg, customName] = process.argv;

// Convertir les dimensions en nombres
const width = parseInt(widthArg) || 1200;  // valeur par défaut : 1200
const height = parseInt(heightArg) || 600; // valeur par défaut : 600

fs.readdirSync(inputFolder).forEach((file, index) => {
                                                            const inputPath = path.join(inputFolder, file);

                                                            // Si un nom personnalisé est fourni, utilise-le, sinon garde le nom original
                                                            let outputName;
                                                            if (customName) {
                                                                // Ajouter un index pour éviter d'écraser les fichiers
                                                                outputName = `${customName}-${index + 1}.webp`;
                                                            } else {
                                                                outputName = path.parse(file).name + ".webp";
                                                            }

                                                            const outputPath = path.join(outputFolder, outputName);

                                                            sharp(inputPath)
                                                                .resize(width, height, { fit: "cover" })
                                                                .toFormat("webp", { quality: 80 })
                                                                .toFile(outputPath)
                                                                .then(() => console.log(`Optimisé : ${file} → ${outputPath}`))
                                                                .catch(err => console.error("Erreur :", err));
                                                      });
