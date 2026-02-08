-- Créer la table pour stocker les codes de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  CONSTRAINT expires_at_check CHECK (expires_at > created_at)
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);

-- Index pour recherche rapide par code
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);

-- Politique RLS : Tout le monde peut insérer et consulter ses propres codes
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert reset codes" 
  ON password_reset_codes FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow reading own reset codes" 
  ON password_reset_codes FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow updating own reset codes" 
  ON password_reset_codes FOR UPDATE 
  TO authenticated, anon
  USING (true);
