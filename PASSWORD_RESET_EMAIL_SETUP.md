# Password Reset - Email Integration Guide

## Overview
This guide explains how to implement email sending for the password reset flow.

## Option 1: Supabase Edge Function (Recommended)

### Step 1: Create Supabase Edge Function
Create a new file `supabase/functions/send-reset-code/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email et code requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Send email via SendGrid
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email }],
            subject: "Réinitialisez votre mot de passe",
          },
        ],
        from: {
          email: "noreply@scobe.com",
          name: "Scobe",
        },
        content: [
          {
            type: "text/html",
            value: `
              <h2>Réinitialisation de mot de passe</h2>
              <p>Votre code de réinitialisation est: <strong>${code}</strong></p>
              <p>Ce code expire dans 15 minutes.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Email sent" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### Step 2: Deploy Function
```bash
supabase functions deploy send-reset-code
```

### Step 3: Set Environment Variables
In Supabase dashboard, set the `SENDGRID_API_KEY` secret.

### Step 4: Update UserAuthContext.jsx

Modify the `requestPasswordReset` function to call the Edge Function:

```javascript
const requestPasswordReset = async (email) => {
  try {
    setError(null);
    
    // Generate code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store code in database
    const { error: dbError } = await supabase
      .from('password_reset_codes')
      .insert([
        {
          email: email.toLowerCase(),
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // Call Edge Function to send email
    const { data, error: functionError } = await supabase.functions.invoke(
      'send-reset-code',
      {
        body: { email, code }
      }
    );

    if (functionError) {
      console.error('Function error:', functionError);
      // Still return success if email fails (user can check spam folder)
    } else {
      console.log('Email sent successfully');
    }

    return { ok: true, message: 'Code de réinitialisation envoyé à votre email' };
  } catch (err) {
    const errorMessage = err.message || 'Erreur lors de la demande de réinitialisation';
    setError(errorMessage);
    return { ok: false, error: errorMessage };
  }
};
```

## Option 2: SendGrid API (Direct)

If you prefer to call SendGrid directly from frontend, use:

```bash
npm install @sendgrid/mail
```

Then in `requestPasswordReset`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

const msg = {
  to: email,
  from: 'noreply@scobe.com',
  subject: 'Réinitialisez votre mot de passe',
  html: `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Votre code de réinitialisation est: <strong>${code}</strong></p>
    <p>Ce code expire dans 15 minutes.</p>
  `,
};

await sgMail.send(msg);
```

⚠️ **Warning**: This exposes your SendGrid API key on the frontend. NOT RECOMMENDED.

## Option 3: Backend API

Create a backend endpoint that handles email sending:

```javascript
// Backend (Node.js/Express)
app.post('/api/send-reset-code', async (req, res) => {
  const { email, code } = req.body;
  
  const msg = {
    to: email,
    from: 'noreply@scobe.com',
    subject: 'Réinitialisez votre mot de passe',
    html: `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Votre code de réinitialisation est: <strong>${code}</strong></p>
      <p>Ce code expire dans 15 minutes.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then call from frontend:
```javascript
const response = await fetch('/api/send-reset-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, code })
});
```

## Testing

### Development Environment
For testing without actual email sending, modify `requestPasswordReset` to:

```javascript
// Log code to console instead of sending email
console.log(`Reset code for ${email}: ${code}`);

// Or show in alert
alert(`Code de réinitialisation: ${code}`);
```

### Production Environment
1. Set `SENDGRID_API_KEY` environment variable
2. Verify SendGrid account is active
3. Test with real email addresses
4. Monitor email delivery logs in SendGrid dashboard

## Email Template Customization

Enhance the email template with:
- Your logo
- Brand colors
- Professional formatting
- Call-to-action button
- Footer with company info

Example:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
    <h1>Scobe</h1>
  </div>
  
  <div style="padding: 20px;">
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé une réinitialisation de mot de passe. Entrez ce code:</p>
    
    <div style="background-color: #f0f0f0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
      <h3 style="letter-spacing: 5px; color: #007bff;">${code}</h3>
    </div>
    
    <p>Ce code expire dans 15 minutes.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
    <p>&copy; 2024 Scobe. Tous droits réservés.</p>
  </div>
</div>
```

## Troubleshooting

### Email not received
1. Check spam/junk folder
2. Verify email address is correct
3. Check SendGrid delivery logs
4. Ensure API key is valid

### Code failing to validate
1. Verify code was saved to database
2. Check expiry timestamp
3. Ensure `used` flag is false before verification

### CORS errors
If calling SendGrid directly from frontend, enable CORS in SendGrid settings.

