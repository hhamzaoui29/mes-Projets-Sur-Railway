const DataBase = require('../models/dataBase');

async function debug() {
    console.log('🔍 Test de sauvegarde...');
    
    const db = new DataBase();
    
    // Test 1: Vérifier le dossier data
    console.log('\n📁 Test 1: ensureDataDir()');
    await db.ensureDataDir();
    
    // Test 2: getFilePath
    console.log('\n📁 Test 2: getFilePath()');
    const filePath = db.getFilePath('test-debug.json');
    console.log('Chemin:', filePath);
    
    // Test 3: Sauvegarde
    console.log('\n💾 Test 3: save()');
    const contenu = {
        "1/- Test": ["Question 1", "Question 2"]
    };
    
    const resultat = await db.save('test-debug.json', contenu);
    console.log('Résultat:', resultat);
    
    // Test 4: Vérifier si le fichier existe
    console.log('\n🔍 Test 4: exists()');
    const existe = await db.exists('test-debug.json');
    console.log('Le fichier existe?', existe);
}

debug().catch(console.error);