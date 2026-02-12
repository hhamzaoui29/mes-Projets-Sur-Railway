const fs = require("fs");
const path = require("path");

/**
 * Déplace un fichier uploadé vers le bon dossier et renomme proprement
 * @param {Object} file - L'objet req.file de Multer
 * @param {string} fileName - La catégorie choisie par l'utilisateur
 * @returns {string} - Le chemin à enregistrer en DB
 */
function uploadImage(file, fileName) {
                                          if (!file) throw new Error("Aucun fichier uploadé");

                                          // 📂 Création du dossier si inexistant
                                          //const folder = path.join(__dirname, "../public/images/", fileName);
                                          const folder = path.join(__dirname, "../siteVitrine/public/images/", fileName);

                                          if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

                                          // 🎯 Récupérer l'extension (jpg, png, etc.)
                                          const ext = path.extname(file.originalname);

                                          // 📝 Créer un nouveau nom de fichier unique
                                          const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
                                          const newPath = path.join(folder, safeName);

                                          // 🚀 Déplacer le fichier uploadé
                                          fs.renameSync(file.path, newPath);

                                          // 🔗 Chemin pour la base de données (accessible depuis /public)
                                          return `/images/${fileName}/${safeName}`;
                                       }
                     
/**
* Supprime physiquement une image du dossier /public
* @param {string} imagePath - chemin stocké en DB (ex: /images/galerie/nom.jpg)
*/
function deleteImage(imagePath) {
  try {
      if (!imagePath) return;

      let filePath;

      // Si image siteVitrine
      if (imagePath.startsWith("/siteVitrine/")) {
          // Supprime le préfixe /siteVitrine pour pointer dans src/features/siteVitrine/public
          filePath = path.join(__dirname, "../src/features/siteVitrine/public", imagePath.replace("/siteVitrine/", ""));
      } else {
          // Sinon dossier public racine
          filePath = path.join(__dirname, "../public", imagePath.replace(/^\/+/, ""));
      }

      if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("✅ Image supprimée :", filePath);
      } else {
          console.warn("⚠️ Fichier non trouvé :", filePath);
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

      let absolutePath;

      // Détecter si c'est une image siteVitrine
      if (filePath.startsWith("/siteVitrine/")) {
          absolutePath = path.join(__dirname, "../src/features/siteVitrine/public", filePath.replace("/siteVitrine/", ""));
      } else {
          // Sinon dossier public racine
          absolutePath = path.join(__dirname, "../public", filePath.replace(/^\/+/, ""));
      }

      if (fs.existsSync(absolutePath)) {
          // Créer dossier archive s'il n'existe pas
          const archiveDir = path.join(path.dirname(absolutePath), "../Images-archivees");
          if (!fs.existsSync(archiveDir)) {
              fs.mkdirSync(archiveDir, { recursive: true });
          }

          const fileName = path.basename(filePath);
          const archivePath = path.join(archiveDir, fileName);

          // Déplacer le fichier
          fs.renameSync(absolutePath, archivePath);

          console.log("✅ Image archivée :", archivePath);

          // Retourner chemin pour base de données ou log
          if (filePath.startsWith("/siteVitrine/")) {
              return `/siteVitrine/Images-archivees/${fileName}`;
          } else {
              return `/Images-archivees/${fileName}`;
          }
      } else {
          console.warn("⚠️ Fichier non trouvé pour archivage :", absolutePath);
      }
  } catch (err) {
      console.error("❌ Erreur lors de l'archivage :", err.message);
  }

  return null;
}

/**
 * Supprime les fichiers archivés plus vieux que "maxAgeDays"
 * @param {string} type - sous-dossier d’archive (ex: "services", "galerie")
 * @param {number} maxAgeDays - âge max des fichiers avant suppression
 */
function cleanArchives(type, maxAgeDays) {
  // Dossiers archives possibles
  const archives = [
      path.join(__dirname, "..", "public", "archive", type),                  // archive racine
      path.join(__dirname, "..", "src/features/siteVitrine/public", "archive", type) // archive siteVitrine
  ];

  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  archives.forEach(archiveDir => {
      if (!fs.existsSync(archiveDir)) {
          console.log("📂 Aucun dossier archive trouvé :", archiveDir);
          return;
      }

      const files = fs.readdirSync(archiveDir);

      files.forEach(file => {
          const filePath = path.join(archiveDir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtimeMs > maxAgeMs) {
              fs.unlinkSync(filePath);
              console.log("🗑️ Fichier supprimé :", filePath);
          }
      });
  });
}
/**
 * 
 * @param {*} oldImagePath 
 * @param {*} newFile 
 * @param {*} folderName 
 * @returns 
 */
                                        
function archiveBeforeReplace(oldImagePath, newFile, folderName, isSiteVitrine = false) {
  if (!newFile) return null;

  try {
      let baseDir = isSiteVitrine 
                    ? path.join(__dirname, "../src/features/siteVitrine/public") 
                    : path.join(__dirname, "../public");

      // 1️⃣ Archiver ancienne image si elle existe
      if (oldImagePath) {
          const oldFullPath = path.join(baseDir, oldImagePath.replace(isSiteVitrine ? "/siteVitrine/" : "/", ""));
          
          if (fs.existsSync(oldFullPath)) {
              const archiveFolder = path.join(baseDir, "Images_archive", "Image_modifie", folderName);
              if (!fs.existsSync(archiveFolder)) fs.mkdirSync(archiveFolder, { recursive: true });

              const fileName = path.basename(oldImagePath);
              const archivePath = path.join(archiveFolder, fileName);

              fs.renameSync(oldFullPath, archivePath);
              console.log(`✅ Ancienne image archivée dans : ${archivePath}`);
          }
      }

      // 2️⃣ Gérer la nouvelle image
      const ext = path.extname(newFile.originalname);
      const safeName = `${Date.now()}-${newFile.originalname.replace(/\s+/g, "_")}`;
      const folder = path.join(baseDir, "images", folderName);

      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

      const newPath = path.join(folder, safeName);
      fs.renameSync(newFile.path, newPath);

      return isSiteVitrine 
             ? `/siteVitrine/images/${folderName}/${safeName}`
             : `/images/${folderName}/${safeName}`;

  } catch (err) {
      console.error("❌ Erreur archiveBeforeReplace :", err.message);
      return null;
  }
}
                                                                              
/**
 * Déplace une image dans archive avant suppression d’un enregistrement
 * @param {string} imagePath - chemin relatif de l’image (ex: "/images/services/xxx.png")
 * @param {string} folderName - nom du dossier (ex: "services", "galerie")
 * @returns {string|null} - chemin de l’image archivée ou null si échec
 */
function archiveBeforeDelete(imagePath, folderName, isSiteVitrine = false) {

          if (!imagePath) return null;

          try {
              const baseDir = isSiteVitrine 
                              ? path.join(__dirname, "../src/features/siteVitrine/public") 
                              : path.join(__dirname, "../public");

              const absolutePath = path.join(baseDir, imagePath.replace(isSiteVitrine ? "/siteVitrine/" : "/", ""));

              if (fs.existsSync(absolutePath)) {
                  const archiveFolder = path.join(baseDir, "Images_archive", "Images_Supprime", folderName);
                  if (!fs.existsSync(archiveFolder)) fs.mkdirSync(archiveFolder, { recursive: true });

                  const fileName = path.basename(imagePath);
                  const archivePath = path.join(archiveFolder, fileName);

                  fs.renameSync(absolutePath, archivePath);
                  console.log(`✅ Image archivée avant suppression : ${archivePath}`);

                  return isSiteVitrine 
                        ? `/siteVitrine/Images_archive/Images_Supprime/${folderName}/${fileName}`
                        : `/Images_archive/Images_Supprime/${folderName}/${fileName}`;
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
