-- Ajoute un champ reference à la table products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS reference TEXT;

-- Optionnel : index sur la référence pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_products_reference ON products(reference);