-- Ajouter les politiques RLS pour permettre l'écriture (migration)
-- Exécute ce script dans l'éditeur SQL de Supabase

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow public read access" ON subcategories;
DROP POLICY IF EXISTS "Allow public read access" ON products;

-- Nouvelles politiques : permettre la lecture et écriture (pour l'import initial)
CREATE POLICY "Allow all access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON products FOR ALL USING (true) WITH CHECK (true);

-- Après la migration, tu peux restreindre avec :
-- DROP POLICY "Allow all access" ON categories;
-- CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated write" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
