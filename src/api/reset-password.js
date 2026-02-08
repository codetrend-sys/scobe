/**
 * API endpoint pour réinitialiser le mot de passe
 * Utilise le SERVICE_ROLE_KEY du .env pour avoir les permissions admin
 */

import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Paramètres manquants' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer client admin avec SERVICE_ROLE_KEY
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase config');
      return new Response(
        JSON.stringify({ ok: false, error: 'Configuration serveur manquante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Vérifier le code
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('password_reset_codes')
      .select('id, expires_at, used')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Code invalide' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (codeData.used) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Code déjà utilisé' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Code expiré' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError || !users) {
      console.error('List users error:', listError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Erreur serveur' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Utilisateur non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Erreur: ' + updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Marquer le code comme utilisé
    await supabaseAdmin
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    return new Response(
      JSON.stringify({ ok: true, message: 'Mot de passe réinitialisé' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
