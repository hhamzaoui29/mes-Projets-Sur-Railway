
const multer = require("multer");
const path = require("path");



// 📂 Dossier temporaire avant déplacement
const storage = multer.diskStorage({
                                        destination: "uploads/",
                                        // Multer attend toujours next(err, filename)
                                        filename: (req, file, next) => next(null, file.originalname) 
                                    });
  
  // 📌 Filtrage des fichiers (JPG, PNG, GIF uniquement)
  const fileFilter = (req, file, next) => {
                                                const allowedTypes = [".jpeg", ".jpg", ".png", ".gif", ".webp"];
                                                const ext = path.extname(file.originalname).toLowerCase();
                                            
                                                if (allowedTypes.includes(ext)) {
                                                                                    return next(null, true); // ✅ accepté
                                                                                }
                                                return next(new Error("Seuls les fichiers JPG, PNG Webp et GIF sont autorisés !"), false);
                                           };
  
  // ⚙️ Configuration multer
  const upload = multer({
                            storage,
                            limits: { fileSize: 5 * 1024 * 1024 }, // ⛔ 5 Mo max
                            fileFilter
                        });

module.exports = {
                    upload,
                 }


                 