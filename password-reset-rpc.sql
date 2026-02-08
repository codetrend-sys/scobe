-- Create RPC function to reset password with code
-- This function should be created in Supabase PostgreSQL database

CREATE OR REPLACE FUNCTION reset_password_with_code(
  email_input TEXT,
  code_input TEXT,
  new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  user_id UUID;
  error_message TEXT;
BEGIN
  -- Validate input
  IF email_input IS NULL OR code_input IS NULL OR new_password IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Paramètres requis manquants');
  END IF;

  -- Check if code exists and is valid
  IF NOT EXISTS (
    SELECT 1 FROM password_reset_codes 
    WHERE email = LOWER(email_input) 
    AND code = code_input 
    AND NOT used 
    AND expires_at > NOW()
  ) THEN
    RETURN json_build_object('ok', false, 'error', 'Code invalide ou expiré');
  END IF;

  -- Find user by email in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = LOWER(email_input);
  IF user_id IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Utilisateur non trouvé');
  END IF;

  -- Update user password in auth.users
  -- Note: This requires proper Supabase setup. The raw_user_meta_data is used as a workaround
  -- since direct password update is restricted
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  -- Mark code as used
  UPDATE password_reset_codes 
  SET used = true 
  WHERE email = LOWER(email_input) 
  AND code = code_input;

  RETURN json_build_object('ok', true, 'message', 'Mot de passe réinitialisé avec succès');

EXCEPTION WHEN OTHERS THEN
  error_message := SQLERRM;
  RETURN json_build_object('ok', false, 'error', error_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_password_with_code(TEXT, TEXT, TEXT) TO authenticated;

-- Grant permission to anon users (for password reset flow)
GRANT EXECUTE ON FUNCTION reset_password_with_code(TEXT, TEXT, TEXT) TO anon;
