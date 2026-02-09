import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json()

    // Validation
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email et code requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Validation de l'email (format basique)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Validation du code (6 chiffres)
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: "Code invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Option 1: Using Resend (Recommended - Free tier available)
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@scobe.fr" // Domaine personnalisé configuré dans Resend
    
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: email,
          subject: "Réinitialisez votre mot de passe Scobe",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .code-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
                  .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                  .warning { color: #ff6b6b; font-size: 14px; margin-top: 20px; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🔐 Réinitialisation de mot de passe</h1>
                  </div>
                  <div class="content">
                    <p>Bonjour,</p>
                    <p>Vous avez demandé une réinitialisation de votre mot de passe Scobe. Entrez ce code ci-dessous:</p>
                    
                    <div class="code-box">
                      <div class="code">${code}</div>
                    </div>

                    <p><strong>Durée de validité:</strong> Ce code expire dans 15 minutes.</p>

                    <div class="warning">
                      ⚠️ Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                    </div>

                    <p>Instructions:</p>
                    <ol>
                      <li>Copiez le code ci-dessus</li>
                      <li>Rendez-vous sur la page de réinitialisation</li>
                      <li>Collez le code</li>
                      <li>Entrez votre nouveau mot de passe</li>
                    </ol>
                  </div>
                  
                  <div class="footer">
                    <p>&copy; 2024-2026 Scobe. Tous droits réservés.</p>
                    <p>Cet email a été envoyé à ${email}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("Resend error:", data)
        return new Response(
          JSON.stringify({ error: "Erreur lors de l'envoi d'email", details: data }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Email envoyé avec succès", id: data.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Option 2: Using SendGrid (Alternative)
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY")
    
    if (sendgridApiKey) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email }],
              subject: "Réinitialisez votre mot de passe Scobe",
            },
          ],
          from: {
            email: "noreply@scobe.fr",
            name: "Scobe",
          },
          content: [
            {
              type: "text/html",
              value: `
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h2>🔐 Réinitialisation de mot de passe</h2>
                      <p>Bonjour,</p>
                      <p>Vous avez demandé une réinitialisation de votre mot de passe. Voici votre code:</p>
                      <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea;">${code}</div>
                      </div>
                      <p>Ce code expire dans 15 minutes.</p>
                      <p style="color: #ff6b6b;">⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                    </div>
                  </body>
                </html>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("SendGrid error:", error)
        return new Response(
          JSON.stringify({ error: "Erreur lors de l'envoi d'email", details: error }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Email envoyé avec succès" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // If neither API key is set, return error
    return new Response(
      JSON.stringify({ 
        error: "Aucun service d'email configuré. Veuillez configurer RESEND_API_KEY ou SENDGRID_API_KEY." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )

  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur serveur inconnue"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
