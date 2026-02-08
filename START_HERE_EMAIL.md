# 🎯 START HERE - Setup Email en 5 Minutes

## ⏱️ Temps: 5 minutes
## 💪 Difficulté: Très Facile
## 🎯 Résultat: Emails de réinitialisation 100% fonctionnels

---

## 📋 Ce qu'on fait

**Avant:** L'utilisateur rentre son email, mais ne reçoit rien
**Après:** L'utilisateur reçoit un email avec le code en 1-2 secondes ✉️

---

## 🚀 Option 1: LE PLUS SIMPLE (Recommandé) ⚡

**Juste 1 commande PowerShell!**

```powershell
PowerShell -ExecutionPolicy Bypass -File setup-email.ps1
```

→ Le script demande:
1. Quel email service? (Resend ou SendGrid)
2. Votre clé API?

→ Le script fait le reste automatiquement ✅

**Fin! 🎉**

---

## 🔧 Option 2: Manuel (Si Option 1 ne marche pas)

### Étape 1: Créer Compte Email (2 min)

Choisir UNE option:

**A) Resend (PLUS FACILE)**
1. Allez: https://resend.com
2. Sign Up avec email
3. Vérifiez votre email
4. Cliquez "API Keys" (gauche)
5. "Create API Key"
6. **Copiez la clé** (commence par `re_`)

**B) SendGrid**
1. Allez: https://sendgrid.com
2. Sign Up
3. Vérifiez email
4. Settings → API Keys
5. Create API Key → Mail Send ✓
6. **Copiez la clé** (commence par `SG.`)

### Étape 2: Ajouter à Supabase (1 min)

Ouvrez PowerShell/Terminal:

```bash
# Pour Resend:
supabase secrets set RESEND_API_KEY="re_votre_clé_ici"

# OU pour SendGrid:
supabase secrets set SENDGRID_API_KEY="SG.votre_clé_ici"

# Ensuite:
supabase functions deploy send-reset-code
```

Attendre 30-60 secondes...

### Étape 3: Vérifier (30 sec)

```bash
supabase functions list
```

Vous devriez voir: `send-reset-code` ← Status "Active"

---

## ✅ Test (2 min)

1. **Ouvrir:** http://localhost:5173/forgot-password

2. **Entrer:** Votre email

3. **Cliquer:** "Envoyer un code"

4. **Attendre:** 1-2 secondes

5. **Vérifier:** Votre email (inbox ou **SPAM**)

6. **Vous devriez voir:**
   ```
   From: Scobe <noreply@scobe.fr>
   Subject: Réinitialisez votre mot de passe Scobe
   
   Body: Votre code: 123456
   ```

7. **Copier:** Le code (6 chiffres)

8. **Retourner:** Sur la page

9. **Coller:** Le code dans le formulaire

10. **Entrer:** Nouveau mot de passe

11. **Cliquer:** "Réinitialiser"

12. **✅ C'est bon!** Redirection vers login

---

## 🎁 C'est TOUT !

Une fois que vous recevez l'email, c'est **terminé**:
- ✅ Frontend travaille
- ✅ Backend travaille
- ✅ Email arrive
- ✅ Code valide
- ✅ Réinitialisation fonctionnelle

---

## 🐛 Pas d'email reçu?

### Vérification Rapide

1. **Vérifier Spam/Junk** ← IMPORTANT!
   - Marquer comme "Not Spam"

2. **Attendre plus longtemps**
   - Parfois 5-10 secondes

3. **Vérifier la clé API**
   ```bash
   supabase secrets list
   ```
   Devrait voir: `RESEND_API_KEY` ou `SENDGRID_API_KEY`

4. **Redéployer**
   ```bash
   supabase functions deploy send-reset-code
   ```

5. **Voir les logs**
   ```bash
   supabase functions show send-reset-code
   ```

---

## 📚 Pour Plus de Détails

- `QUICK_START_EMAIL.md` - Guide visuel complet
- `EMAIL_SETUP_README.md` - Guide technique
- `EDGE_FUNCTION_DEPLOYMENT.md` - Deep dive

---

## 🎉 C'est Tout!

| Step | Status |
|------|--------|
| 1. Script OU config | ⬅️ VOUS ÊTES ICI |
| 2. Email service | ✅ FAIT |
| 3. Deploy fonction | ✅ FAIT |
| 4. Test | ✅ FAIT |
| 5. Done! | 🎊 |

**Estimated time:** 5-10 minutes  
**Difficulty:** ⭐ Super Easy

---

## 🚀 Commandes Rapides

```bash
# Vérifier setup
supabase functions list
supabase secrets list

# Redéployer si besoin
supabase functions deploy send-reset-code

# Voir les logs
supabase functions show send-reset-code
```

---

## 💡 Points Importants

- ✅ Gratuit (Resend 100/jour, SendGrid 100/mois)
- ✅ Simple (5 minutes)
- ✅ Sécurisé (Chiffré, clé privée)
- ✅ Rapide (< 2 secondes par email)
- ✅ Prêt (Aucune autre config requise)

---

## 🎯 Prochaine Étape

### Maintenant:
```powershell
PowerShell -ExecutionPolicy Bypass -File setup-email.ps1
```

→ **Allez-y! 🚀**

---

**Status:** Prêt à Setup  
**Temps Restant:** ~5 minutes  
**Complexité:** Très Facile  

**Let's go! 💪**

