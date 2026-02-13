-- Schéma SQL pour Supabase
-- Exécute ce script dans l'éditeur SQL de Supabase (Dashboard > SQL Editor)

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des sous-catégories
CREATE TABLE IF NOT EXISTS subcategories (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  subcategory_id BIGINT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Active la sécurité au niveau des lignes
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : Permettre la lecture à tous, l'écriture seulement aux admins authentifiés
-- Pour l'instant, on permet tout (tu peux ajuster selon tes besoins)
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);

-- Pour les opérations d'écriture, tu devras créer des politiques basées sur ton système d'auth admin
-- Exemple (à adapter selon ton système d'auth) :
-- CREATE POLICY "Allow admin write access" ON categories FOR ALL USING (auth.role() = 'admin');

-- Table des commandes (orders)
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT,
  user_id UUID,
  -- `user_id` can be NULL for guest visitors; shipping holds visitor contact info
  shipping JSONB,
  items JSONB,
  total NUMERIC(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Activer RLS pour orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique (ajuste si nécessaire)
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);

-- Politique insertion publique (permet aux visiteurs/anonymes d'enregistrer une commande)
-- ATTENTION: cela permet aux clients anonymes d'insérer des commandes. Si tu préfères
-- restreindre, crée une policy plus stricte.
CREATE POLICY "Allow public insert" ON orders FOR INSERT WITH CHECK (true);

-- Politique update publique (permet de mettre à jour le statut)
CREATE POLICY "Allow public update" ON orders FOR UPDATE USING (true) WITH CHECK (true);

-- Politique delete publique (permet de supprimer une commande)
CREATE POLICY "Allow public delete" ON orders FOR DELETE USING (true);

