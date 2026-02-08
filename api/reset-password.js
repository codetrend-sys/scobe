import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const { email, code, newPassword } = req.body || {};

    if (!email || !code || !newPassword) {
      return res.status(400).json({ ok: false, error: 'Paramètres manquants' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase config');
      return res.status(500).json({ ok: false, error: 'Configuration serveur manquante' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('password_reset_codes')
      .select('id, expires_at, used')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      return res.status(400).json({ ok: false, error: 'Code invalide' });
    }

    if (codeData.used) {
      return res.status(400).json({ ok: false, error: 'Code déjà utilisé' });
    }

    if (new Date(codeData.expires_at) < new Date()) {
      return res.status(400).json({ ok: false, error: 'Code expiré' });
    }

    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError || !listData) {
      console.error('List users error:', listError);
      return res.status(500).json({ ok: false, error: 'Erreur serveur' });
    }

    const users = listData.users || listData;
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Utilisateur non trouvé' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      return res.status(500).json({ ok: false, error: 'Erreur: ' + (updateError.message || updateError) });
    }

    await supabaseAdmin
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    return res.status(200).json({ ok: true, message: 'Mot de passe réinitialisé' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Erreur serveur' });
  }
}
