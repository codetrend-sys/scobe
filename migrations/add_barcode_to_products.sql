-- Ajoute un champ barcode à la table products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Optionnel : index unique pour accélérer les recherches par code-barres
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
