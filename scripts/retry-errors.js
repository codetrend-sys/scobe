/**
 * Retry script for entries recorded in migrate-errors.json
 * Usage: node scripts/retry-errors.js
 * Produces: migrate-errors-retry.json with remaining failures
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ERR_PATH = join(__dirname, '..', 'migrate-errors.json');
const OUT_PATH = join(__dirname, '..', 'migrate-errors-retry.json');

if (!existsSync(ERR_PATH)) {
  console.error('No migrate-errors.json found. Nothing to retry.');
  process.exit(0);
}

let raw = readFileSync(ERR_PATH, 'utf-8');
let errors = [];
try { errors = JSON.parse(raw); } catch (e) { console.error('Invalid JSON in migrate-errors.json'); process.exit(1); }

async function findOrCreateCategory(name) {
  if (!name) return null;
  const { data: existing, error: selErr } = await supabase.from('categories').select('id').eq('name', name).limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id;
  const { data, error } = await supabase.from('categories').insert({ name, image_url: null, description: null }).select().single();
  if (error) throw error;
  return data.id;
}

async function findOrCreateSubcategory(name, categoryId) {
  if (!name) return null;
  const { data: existing, error: selErr } = await supabase.from('subcategories').select('id').eq('name', name).eq('category_id', categoryId).limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) return existing.id;
  const { data, error } = await supabase.from('subcategories').insert({ category_id: categoryId, name, image_url: null }).select().single();
  if (error) throw error;
  return data.id;
}

async function upsertProduct(product, subcategoryId) {
  const name = product.name || product.title || 'Unnamed';
  const price = (() => { const p = Number(product.price); return Number.isFinite(p) ? p : 0; })();
  const rating = (() => { const r = Number(product.rating); return Number.isFinite(r) ? r : 0; })();

  const payload = {
    subcategory_id: subcategoryId,
    name,
    price,
    rating,
    image_url: null,
    featured: !!product.featured,
  };

  const { data: existing, error: selErr } = await supabase.from('products').select('id').eq('name', name).eq('subcategory_id', subcategoryId).limit(1).maybeSingle();
  if (selErr) throw selErr;
  if (existing?.id) {
    const { data, error } = await supabase.from('products').update(payload).eq('id', existing.id).select().single();
    if (error) throw error;
    return { action: 'updated', id: data.id };
  } else {
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return { action: 'inserted', id: data.id };
  }
}

async function run() {
  console.log(`Retrying ${errors.length} failed entries...`);
  const remaining = [];
  let inserted = 0, updated = 0, failed = 0;

  for (const e of errors) {
    const p = e.product;
    const catName = e.category || (p && p.category) || null;
    const subName = e.subcategory || (p && p.subcategory) || null;

    try {
      const catId = catName ? await findOrCreateCategory(catName) : null;
      const subId = subName ? await findOrCreateSubcategory(subName, catId) : null;

      // retry up to 3 times
      let attempt = 0; let ok = false; let res = null;
      while (attempt < 3 && !ok) {
        attempt++;
        try {
          res = await upsertProduct(p, subId);
          ok = true;
        } catch (err) {
          if (attempt >= 3) throw err;
          await new Promise(r => setTimeout(r, 200));
        }
      }
      if (ok) {
        if (res.action === 'inserted') inserted++;
        if (res.action === 'updated') updated++;
      }
    } catch (err) {
      failed++;
      remaining.push({ error: String(err.message || err), product: p, category: catName, subcategory: subName });
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(remaining, null, 2), 'utf-8');
  console.log(`Done. inserted=${inserted} updated=${updated} failed=${failed}. Remaining logged to ${OUT_PATH}`);
}

run().catch(err => { console.error('Fatal error:', err); process.exit(1); });
