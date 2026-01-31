/**
 * Script de configuration du bucket Supabase Storage
 * Exécutez ce script une fois pour créer le bucket 'scobe-images'
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // À ajouter dans .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: VITE_SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant');
  console.error('Ajoutez ces variables dans votre fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  try {
    console.log('🔄 Configuration du bucket Supabase Storage...');

    // Essayer de créer le bucket
    const { data, error } = await supabase.storage.createBucket('scobe-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "scobe-images" existe déjà');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket "scobe-images" créé avec succès');
    }

    // Mettre à jour les RLS policies
    console.log('🔄 Configuration des RLS policies...');

    // Permettre les lectures publiques
    const { error: selectError } = await supabase.rpc('create_policy_if_not_exists', {
      bucket_id: 'scobe-images',
      definition: `CREATE POLICY "Allow public read" ON storage.objects
                  FOR SELECT USING (bucket_id = 'scobe-images')`,
    });

    if (selectError && !selectError.message.includes('already exists')) {
      console.warn('⚠️ Policy public read - ajouter manuellement dans Supabase Dashboard');
    }

    console.log('✅ Configuration complétée!');
    console.log('');
    console.log('📌 Prochaines étapes:');
    console.log('1. Allez sur https://app.supabase.com');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Onglet "Storage" -> "scobe-images"');
    console.log('4. Assurez-vous que le bucket est public (Public OFF/ON toggle)');
    console.log('5. Vérifiez les RLS policies pour permettre les uploads');
    console.log('');
    console.log('💡 Pour configurer les RLS policies manuellement:');
    console.log('   - Allez à "Storage" -> "Policies"');
    console.log('   - Recherchez "scobe-images"');
    console.log('   - Ajoutez une policy "Allow public read"');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupStorageBucket();
