import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ ok: false, error: "Paramètres manquants" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Créer client admin Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Configuration manquante" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier le code
    const { data: codeData, error: codeError } = await supabase
      .from("password_reset_codes")
      .select("id, expires_at, used")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .single()

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ ok: false, error: "Code invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (codeData.used) {
      return new Response(
        JSON.stringify({ ok: false, error: "Code déjà utilisé" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Vérifier expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Code expiré" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Trouver l'utilisateur par email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError || !users) {
      console.error("List users error:", listError)
      return new Response(
        JSON.stringify({ ok: false, error: "Erreur serveur" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Utilisateur non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error("Update password error:", updateError)
      return new Response(
        JSON.stringify({ ok: false, error: "Erreur: " + updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Marquer le code comme utilisé
    const { error: markError } = await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("id", codeData.id)

    if (markError) {
      console.warn("Mark code used warning:", markError)
      // Continue même si ça échoue
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Mot de passe réinitialisé" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ ok: false, error: error.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
