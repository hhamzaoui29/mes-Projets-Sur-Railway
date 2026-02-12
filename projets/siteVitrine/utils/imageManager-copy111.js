const fs = require("fs");
const path = require("path");

const { siteVitrinePublic, imagesSubDir } = require("../config/pathConfig");

/**
 * Déplace un fichier uploadé vers le bon dossier et renomme proprement
 * @param {Object} file - L'objet req.file de Multer
 * @param {string} fileName - La catégorie choisie par l'utilisateur
 * @returns {string} - Le chemin à enregistrer en DB
 */
function uploadImage1(file, fileName) {
                                          if (!file) throw new Error("Aucun fichier uploadé");

                                          // 📂 Création du dossier si inexistant
                                          const folder = path.join(__dirname, "../public/images/", fileName);
                                          if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

                                          // 🎯 Récupérer l'extension (jpg, png, etc.)
                                          const ext = path.extname(file.originalname);

                                          // 📝 Créer un nouveau nom de fichier unique
                                          const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
                                          console.log ("nome de la photo dans uploadImage == ",safeName);
                                          const newPath = path.join(folder, safeName);
                                          console.log ("newPath de la photo dans uploadImage == ",newPath);
                                          // 🚀 Déplacer le fichier uploadé
                                          fs.renameSync(file.path, newPath);

                                          // 🔗 Chemin pour la base de données (accessible depuis /public)
                                          return `/images/${fileName}/${safeName}`;
                                       }
     
function uploadImage11(file, folderName, isSiteVitrine) {
                                                        const baseDir = isSiteVitrine
                                                          ? path.join(__dirname, "../src/features/siteVitrine/public")
                                                          : path.join(__dirname, "../public");

                                                        const folder = path.join(baseDir, "images", folderName);

                                                        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

                                                        const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
                                                        const newPath = path.join(folder, safeName);

                                                        fs.renameSync(file.path, newPath);

                                                        // Chemin relatif pour la BDD
                                                        const relativePath = isSiteVitrine
                                                          ? `/siteVitrine/images/${folderName}/${safeName}`
                                                          : `/images/${folderName}/${safeName}`;

                                                        return relativePath;
                                                      }
function uploadImage(file, folderName) {
                                          if (!file) throw new Error("Aucun fichier uploadé");
                                        
                                          const folder = path.join(siteVitrinePublic, imagesSubDir, folderName);
                                          if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
                                        
                                          const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
                                          const newPath = path.join(folder, safeName);
                                          console.log ("newPath = ", new path);
                                          fs.renameSync(file.path, newPath);
                                        
                                          return `/siteVitrinePubli/${imagesSubDir}/${folderName}/${safeName}`;
                                        }

                                                      

/**
* Supprime physiquement une image du dossier /public
* @param {string} imagePath - chemin stocké en DB (ex: /images/galerie/nom.jpg)
*/
function deleteImage(imagePath) {
                                        try {
                                          if (!imagePath) return;
                                      
                                          const filePath = path.join(__dirname, "../public", imagePath);
                                      
                                          if (fs.existsSync(filePath)) {
                                            fs.unlinkSync(filePath);
                                            console.log("✅ Image supprimée :", filePath);
                                          }
                                        } catch (err) {
                                          console.error("❌ Erreur suppression image :", err.message);
                                        }
                                    }
                                      
/**
 * Déplace une ancienne image dans un dossier archive
 * @param {string} filePath - chemin de l'image à archiver (ex: /images/service/xxx.png)
 * @returns {string|null} - chemin final de l'archive ou null si rien n'a été fait
 */
function archiveImage(filePath) {
                                    try {
                                      if (!filePath) return null;

                                      // Construire chemin absolu
                                      const absolutePath = path.join(__dirname, "..", filePath);

                                      if (fs.existsSync(absolutePath)) {
                                        // Créer dossier archive s'il n'existe pas
                                        const archiveDir = path.join(__dirname, "..", "Iamges-archivées");
                                        if (!fs.existsSync(archiveDir)) {
                                          fs.mkdirSync(archiveDir, { recursive: true });
                                        }

                                        const fileName = path.basename(filePath);
                                        const archivePath = path.join(archiveDir, fileName);

                                        // Déplacer le fichier
                                        fs.renameSync(absolutePath, archivePath);

                                        console.log("✅ Image archivée :", archivePath);
                                        return archivePath;
                                      }
                                    } catch (err) {
                                      console.error("Erreur lors de l'archivage :", err.message);
                                    }
                                    return null;
                                 }

/**
 * Supprime les fichiers archivés plus vieux que "maxAgeDays"
 * @param {string} type - sous-dossier d’archive (ex: "services", "galerie")
 * @param {number} maxAgeDays - âge max des fichiers avant suppression
 */
function cleanArchives(type , maxAgeDays ) {
                                                const archiveDir = path.join(__dirname, "..", "archive", type);

                                                if (!fs.existsSync(archiveDir)) {
                                                  console.log("📂 Aucun dossier archive trouvé :", archiveDir);
                                                  return;
                                                }

                                                const files = fs.readdirSync(archiveDir);

                                                const now = Date.now();
                                                const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

                                                files.forEach(file => {
                                                  const filePath = path.join(archiveDir, file);
                                                  const stats = fs.statSync(filePath);

                                                  if (now - stats.mtimeMs > maxAgeMs) {
                                                    fs.unlinkSync(filePath);
                                                    console.log("🗑️ Fichier supprimé :", filePath);
                                                  }
                                                });
                                            }
/**
 * 
 * @param {*} oldImagePath 
 * @param {*} newFile 
 * @param {*} folderName 
 * @returns 
 */
                                        
function archiveBeforeReplace(oldImagePath, newFile, folderName) {
                                                                      if (!oldImagePath) return null;
                                                                    
                                                                      try {
                                                                        const oldFullPath = path.join(__dirname, "../public", oldImagePath);
                                                                    
                                                                        if (fs.existsSync(oldFullPath)) {
                                                                          // 📂 Dossier archive
                                                                          const archiveFolder = path.join(__dirname, "../public/Images_archive/Image_modifie", folderName);
                                                                          if (!fs.existsSync(archiveFolder)) fs.mkdirSync(archiveFolder, { recursive: true });
                                                                    
                                                                          // 📝 Nouveau chemin dans archive
                                                                          const fileName = path.basename(oldImagePath);
                                                                          const archivePath = path.join(archiveFolder, fileName);
                                                                    
                                                                          // 🚀 Déplacer l’ancienne image dans archive
                                                                          fs.renameSync(oldFullPath, archivePath);
                                                                          console.log(`Image archivée dans : ${archivePath}`);
                                                                        }
                                                                      } catch (err) {
                                                                        console.error("Erreur archivage :", err.message);
                                                                      }
                                                                    
                                                                      // ⚡️ Maintenant on gère la nouvelle image
                                                                      const ext = path.extname(newFile.originalname);
                                                                      const safeName = `${Date.now()}-${newFile.originalname.replace(/\s+/g, "_")}`;
                                                                      const folder = path.join(__dirname, "../public/images/", folderName);
                                                                    
                                                                      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
                                                                    
                                                                      const newPath = path.join(folder, safeName);
                                                                      fs.renameSync(newFile.path, newPath);
                                                                    
                                                                      return `/images/${folderName}/${safeName}`;
                                                                  }
                                                                              
/**
 * Déplace une image dans archive avant suppression d’un enregistrement
 * @param {string} imagePath - chemin relatif de l’image (ex: "/images/services/xxx.png")
 * @param {string} folderName - nom du dossier (ex: "services", "galerie")
 * @returns {string|null} - chemin de l’image archivée ou null si échec
 */
function archiveBeforeDelete(imagePath, folderName) {
                                                        if (!imagePath) return null;
                                                      
                                                        try {
                                                          const absolutePath = path.join(__dirname, "../public", imagePath);
                                                      
                                                          if (fs.existsSync(absolutePath)) {
                                                            // 📂 Dossier archive
                                                            const archiveFolder = path.join(__dirname, "../public/Images_archive/Images_Supprime/", folderName);
                                                            if (!fs.existsSync(archiveFolder)) fs.mkdirSync(archiveFolder, { recursive: true });
                                                      
                                                            // 📝 Nouveau chemin dans archive
                                                            const fileName = path.basename(imagePath);
                                                            const archivePath = path.join(archiveFolder, fileName);
                                                      
                                                            // 🚀 Déplacer le fichier
                                                            fs.renameSync(absolutePath, archivePath);
                                                            console.log(`Image archivée avant suppression : ${archivePath}`);
                                                      
                                                            return archivePath;
                                                          } else {
                                                            console.warn("⚠️ Image à archiver introuvable :", absolutePath);
                                                          }
                                                        } catch (err) {
                                                          console.error("❌ Erreur archivage avant suppression :", err.message);
                                                        }
                                                      
                                                        return null;
                                                    }
                                                                     
module.exports = {
                     uploadImage,
                     deleteImage,
                     archiveImage, 
                     cleanArchives,
                     archiveBeforeReplace, 
                     archiveBeforeDelete 
                  };
