/*
 * Script de migration amélioré :
 * - Idempotent : cherche les catégories/sous-catégories par nom avant d'insérer
 * - Pour les produits : met à jour si trouvé (même name + subcategory), sinon insère
 * - Option `--dry` pour simulation sans écrire
 * - Utilise `data.json` exporté par `public/export-data.html`
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');

function loadBoutiqueData() {
  const jsonPath = join(__dirname, '..', 'data.json');
  if (!existsSync(jsonPath)) {
    console.error('❌ Erreur: Le fichier data.json n\'existe pas. Génère-le via public/export-data.html.');
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(jsonPath, 'utf-8'));
  } catch (err) {
    console.error('❌ Impossible de lire data.json:', err.message);
    process.exit(1);
  }
}

const boutiqueData = loadBoutiqueData();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findOrCreateCategory(category, dry = false) {
  const name = category.name;
  const { data: existing, error: selErr } = await supabase.from('categories').select('id, name').eq('name', name).limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing && existing.id) return existing.id;

  if (dry) return null;

  const { data, error } = await supabase.from('categories').insert({ name, image_url: category.imageUrl || null, description: category.description || null }).select().single();
  if (error) throw error;
  return data.id;
}

async function findOrCreateSubcategory(sub, categoryId, dry = false) {
  const name = sub.name;
  const { data: existing, error: selErr } = await supabase.from('subcategories').select('id').eq('name', name).eq('category_id', categoryId).limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing && existing.id) return existing.id;

  if (dry) return null;

  const { data, error } = await supabase.from('subcategories').insert({ category_id: categoryId, name, image_url: sub.imageUrl || null }).select().single();
  if (error) throw error;
  return data.id;
}

async function upsertProduct(product, subcategoryId, dry = false) {
  const name = product.name;
  // Chercher un produit existant avec même nom et même sous-catégorie
  const { data: existing, error: selErr } = await supabase.from('products').select('id, name').eq('name', name).eq('subcategory_id', subcategoryId).limit(1).maybeSingle();
  if (selErr) throw selErr;

  const payload = {
    subcategory_id: subcategoryId,
    name,
    price: Number(product.price) || 0,
    rating: product.rating == null ? null : Number(product.rating),
    image_url: product.imageUrl || null,
    featured: !!product.featured,
  };

  if (existing && existing.id) {
    if (dry) return { action: 'update', id: existing.id };
    const { data, error } = await supabase.from('products').update(payload).eq('id', existing.id).select().single();
    if (error) throw error;
    return { action: 'updated', id: data.id };
  } else {
    if (dry) return { action: 'insert' };
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return { action: 'inserted', id: data.id };
  }
}

async function migrate() {
  console.log(`🚀 Début de la migration vers Supabase (${DRY_RUN ? 'DRY RUN' : 'LIVE'})`);
  const stats = { categories: 0, subcategories: 0, products_inserted: 0, products_updated: 0 };

  for (const category of boutiqueData) {
    try {
      const catId = await findOrCreateCategory(category, DRY_RUN);
      if (!DRY_RUN && catId) stats.categories++;
      console.log(`📁 Catégorie: ${category.name} -> ${catId ?? '(dry)'}`);

      for (const sub of category.subcategories || []) {
        const subId = await findOrCreateSubcategory(sub, catId, DRY_RUN);
        if (!DRY_RUN && subId) stats.subcategories++;
        console.log(`  🗂 Sous-catégorie: ${sub.name} -> ${subId ?? '(dry)'}`);

        for (const p of sub.products || []) {
          try {
            const res = await upsertProduct(p, subId, DRY_RUN);
            if (res) {
              if (res.action === 'inserted') stats.products_inserted++;
              if (res.action === 'updated') stats.products_updated++;
            }
            process.stdout.write('.');
          } catch (prodErr) {
            console.error('\n❌ Erreur produit', p.name, prodErr.message || prodErr);
          }
        }
        process.stdout.write('\n');
      }
    } catch (catErr) {
      console.error('❌ Erreur catégorie', category.name, catErr.message || catErr);
    }
  }

  console.log('\n\n✅ Migration terminée');
  console.log(`   - catégories créées: ${stats.categories}`);
  console.log(`   - sous-catégories créées: ${stats.subcategories}`);
  console.log(`   - produits insérés: ${stats.products_inserted}`);
  console.log(`   - produits mis à jour: ${stats.products_updated}`);
  if (DRY_RUN) console.log('\n(Remarque: mode dry-run — aucune écriture n\'a été effectuée)');
}

migrate().catch(err => { console.error('Erreur fatale:', err); process.exit(1); });
