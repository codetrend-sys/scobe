-- Activer l'extension pgcrypto si elle ne l'est pas déjà
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Créer une fonction RPC pour réinitialiser le mot de passe
-- Cette fonction met à jour le mot de passe dans auth.users
CREATE OR REPLACE FUNCTION reset_password_with_code(
  email_input TEXT,
  code_input TEXT,
  new_password TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reset_code_id UUID;
  auth_user_id UUID;
  error_msg TEXT;
BEGIN
  -- Vérifier que le code existe et est valide
  SELECT id INTO reset_code_id
  FROM password_reset_codes
  WHERE email = email_input AND code = code_input AND used = FALSE AND expires_at > NOW()
  LIMIT 1;
  
  IF reset_code_id IS NULL THEN
    RETURN json_build_object('ok', FALSE, 'error', 'Code invalide ou expiré');
  END IF;
  
  -- Trouver l'utilisateur par email
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = email_input AND deleted_at IS NULL
  LIMIT 1;
  
  IF auth_user_id IS NULL THEN
    RETURN json_build_object('ok', FALSE, 'error', 'Utilisateur non trouvé');
  END IF;
  
  BEGIN
    -- Mettre à jour le mot de passe dans auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf'))
    WHERE id = auth_user_id;
    
    -- Marquer le code comme utilisé
    UPDATE password_reset_codes
    SET used = TRUE
    WHERE id = reset_code_id;
    
    RETURN json_build_object('ok', TRUE, 'message', 'Mot de passe réinitialisé avec succès');
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    RETURN json_build_object('ok', FALSE, 'error', 'Erreur: ' || error_msg);
  END;
END;
$$;

-- Donner les permissions pour exécuter cette fonction
GRANT EXECUTE ON FUNCTION reset_password_with_code(TEXT, TEXT, TEXT) TO anon, authenticated;
