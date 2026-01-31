/**
 * Script pour exporter data.js vers data.json
 * Crée des données de test structurées (images en null)
 * Usage: node scripts/export-data-node.js
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, '..', 'data.json');

try {
  // Lire le fichier data.js et extraire les données avec regex
  const dataFilePath = join(__dirname, '..', 'src', 'components', 'data', 'data.js');
  const fileContent = readFileSync(dataFilePath, 'utf-8');
  
  // Remplacer tous les imports d'images par null pour que le code soit exécutable
  let cleanedCode = fileContent
    .replace(/^import\s+\{[\s\S]*?\}\s+from\s+'\.\.\/\.\.\/images';/m, '') // Enlever les imports d'images
    .replace(/^import\s+\{[\s\S]*?\}\s+from\s+'\.\.\/\.\.\/images';/g, ''); // Tous les imports d'images
  
  // Remplacer les références aux variables d'images par null
  // Récupérer les noms d'images depuis les imports originaux
  const imageImports = fileContent.match(/import\s+\{([\s\S]*?)\}\s+from\s+'\.\.\/\.\.\/images'/);
  if (imageImports && imageImports[1]) {
    const imageNames = imageImports[1].match(/\w+/g) || [];
    for (const name of imageNames) {
      cleanedCode = cleanedCode.replace(new RegExp(`\\b${name}\\b`, 'g'), 'null');
    }
  }
  
  // Extraire et exécuter le code
  const dataMatch = cleanedCode.match(/const boutiqueData = (\[[\s\S]*?\]);/);
  if (!dataMatch) {
    throw new Error('Impossible de trouver boutiqueData dans data.js');
  }
  
  const boutiqueData = eval(dataMatch[1]);
  
  // Écrire dans data.json
  writeFileSync(outputPath, JSON.stringify(boutiqueData, null, 2), 'utf-8');
  
  console.log(`✅ data.json créé : ${outputPath}`);
  console.log(`📊 Résumé:`);
  let totalProducts = 0;
  let totalSubs = 0;
  for (const cat of boutiqueData) {
    totalSubs += (cat.subcategories || []).length;
    for (const sub of cat.subcategories || []) {
      totalProducts += (sub.products || []).length;
    }
  }
  console.log(`   - ${boutiqueData.length} catégorie(s)`);
  console.log(`   - ${totalSubs} sous-catégorie(s)`);
  console.log(`   - ${totalProducts} produit(s)`);
} catch (error) {
  console.error('❌ Erreur lors de l\'export:', error.message);
  console.error(error.stack);
  process.exit(1);
}
