const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de log
const logsDir = path.join(__dirname, '../logs');
const logFilePath = path.join(logsDir, 'server.log');

// Créer le dossier logs si il n'existe pas
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true }); // recursive: true pour créer les sous-dossiers si besoin
}

// Middleware logger
function logger(req, res, next) {
                                    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
                                    
                                    fs.appendFile(logFilePath, logEntry, (err) => {
                                      if (err) {
                                        console.error('Erreur lors de l’écriture du log :', err);
                                      }
                                    });

                                    console.log(logEntry.trim());
                                    next();
                                  }

// Middleware pour logger les erreurs
function errorLogger(err, req, res, next) {
                                                const errorEntry = `[${new Date().toISOString()}] ERROR ${req.method} ${req.url} - ${err.message}\n`;
                                                
                                                fs.appendFile(logFilePath, errorEntry, (fileErr) => {
                                                  if (fileErr) {
                                                    console.error('Erreur lors de l’écriture du log d’erreur :', fileErr);
                                                  }
                                                });

                                                console.error(errorEntry.trim());
                                                next(err); // passer l'erreur au middleware suivant
                                          }

module.exports = {
                    logger,
                    errorLogger
                  };
