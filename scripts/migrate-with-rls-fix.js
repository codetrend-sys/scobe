/**
 * Script pour désactiver RLS, migrer les données, puis réactiver RLS
 * Usage: node scripts/migrate-with-rls-fix.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function loadBoutiqueData() {
  const jsonPath = join(__dirname, '..', 'data.json');
  if (!existsSync(jsonPath)) {
    console.error('❌ data.json non trouvé');
    process.exit(1);
  }
  return JSON.parse(readFileSync(jsonPath, 'utf-8'));
}

async function findOrCreateCategory(category) {
  const name = category.name;
  const { data: existing } = await supabase.from('categories').select('id').eq('name', name).limit(1).maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await supabase.from('categories').insert({ name, image_url: null, description: category.description || null }).select().single();
  if (error) throw error;
  return data.id;
}

async function findOrCreateSubcategory(sub, categoryId) {
  const name = sub.name;
  const { data: existing } = await supabase.from('subcategories').select('id').eq('name', name).eq('category_id', categoryId).limit(1).maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await supabase.from('subcategories').insert({ category_id: categoryId, name, image_url: null }).select().single();
  if (error) throw error;
  return data.id;
}

async function upsertProduct(product, subcategoryId) {
  const name = product.name;
  // Normaliser les champs pour éviter les erreurs de contrainte
  const price = (() => {
    const p = Number(product.price);
    return Number.isFinite(p) ? p : 0;
  })();
  const rating = (() => {
    const r = Number(product.rating);
    return Number.isFinite(r) ? r : 0;
  })();

  const payload = {
    subcategory_id: subcategoryId,
    name,
    price,
    rating,
    image_url: null,
    featured: !!product.featured,
  };

  // Essayer upsert via recherche; si échec, log et continuer
  const { data: existing, error: selErr } = await supabase.from('products').select('id').eq('name', name).eq('subcategory_id', subcategoryId).limit(1).maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { data, error } = await supabase.from('products').update(payload).eq('id', existing.id).select().single();
    if (error) throw error;
    return { action: 'updated' };
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return { action: 'inserted' };
  }
}

async function migrate() {
  console.log('🚀 Migration vers Supabase...\n');
  const boutiqueData = loadBoutiqueData();
  const stats = { categories: 0, subcategories: 0, products_inserted: 0, products_updated: 0, errors: 0 };
  const errorsLogPath = join(__dirname, '..', 'migrate-errors.json');
  // Reset error log
  try { writeFileSync(errorsLogPath, '[]', 'utf-8'); } catch (e) {}

  for (const category of boutiqueData) {
    try {
      const catId = await findOrCreateCategory(category);
      stats.categories++;
      console.log(`📁 ${category.name}`);

      for (const sub of category.subcategories || []) {
        const subId = await findOrCreateSubcategory(sub, catId);
        stats.subcategories++;

        for (const p of sub.products || []) {
          try {
            // retries
            let attempt = 0;
            let res = null;
            while (attempt < 3) {
              attempt++;
              try {
                res = await upsertProduct(p, subId);
                break;
              } catch (err) {
                if (attempt >= 3) throw err;
                await new Promise(r => setTimeout(r, 200));
              }
            }
            if (res.action === 'inserted') stats.products_inserted++;
            if (res.action === 'updated') stats.products_updated++;
            process.stdout.write('.');
          } catch (err) {
            stats.errors++;
            process.stdout.write('✗');
            // Log detailed error
            try {
              const prev = JSON.parse(readFileSync(errorsLogPath, 'utf-8'));
              prev.push({ error: String(err.message || err), product: p, category: category.name, subcategory: sub.name });
              writeFileSync(errorsLogPath, JSON.stringify(prev, null, 2), 'utf-8');
            } catch (e) {
              try { appendFileSync(errorsLogPath, JSON.stringify({ error: String(err.message || err), product: p }) + '\n'); } catch (_) {}
            }
          }
        }
        console.log('');
      }
    } catch (err) {
      stats.errors++;
      console.error(`❌ ${category.name}:`, err.message);
    }
  }

  console.log('\n\n✅ Migration terminée!');
  console.log(`📊 Résultats:`);
  console.log(`   - ${stats.categories} catégorie(s) créée(s)`);
  console.log(`   - ${stats.subcategories} sous-catégorie(s) créée(s)`);
  console.log(`   - ${stats.products_inserted} produit(s) inséré(s)`);
  console.log(`   - ${stats.products_updated} produit(s) mis à jour`);
  if (stats.errors > 0) console.log(`   - ⚠️ ${stats.errors} erreur(s)`);
}

migrate().catch(err => { console.error('Erreur:', err); process.exit(1); });
