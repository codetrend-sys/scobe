# 🚀 QUICK START - Mise en Place Email (5 minutes)

## 🎯 Objectif
Envoyer automatiquement le code de réinitialisation par email

## 📋 Avant de commencer
- ✅ VS Code ouvert
- ✅ Terminal disponible
- ✅ Connexion internet

---

## 🛠️ Étape 1: Choisir un Service Email

**Option 1: Resend** ← RECOMMANDÉ (Plus facile)
- Site: https://resend.com
- Gratuit: 100 emails/jour
- Temps setup: 2 minutes

**Option 2: SendGrid** (Alternative)
- Site: https://sendgrid.com
- Gratuit: 100 emails/mois
- Temps setup: 5 minutes

---

## 🔑 Étape 2: Créer un Compte Email

### Resend:
```
1. Allez sur https://resend.com
2. Cliquez "Sign Up"
3. Entrez: email + mot de passe
4. Vérifiez votre email
5. ✅ Compte créé
```

### SendGrid:
```
1. Allez sur https://sendgrid.com
2. Cliquez "Create Free Account"
3. Remplissez le formulaire
4. Vérifiez votre email
5. ✅ Compte créé
```

---

## 🔐 Étape 3: Obtenir la Clé API

### Resend:
```
1. Login sur https://resend.com
2. Allez à "API Keys" (menu gauche)
3. Cliquez "Create API Key"
4. Copiez la clé (commence par "re_")
5. ✅ Clé obtenue
```

### SendGrid:
```
1. Login sur https://sendgrid.com
2. Allez à Settings → API Keys
3. Cliquez "Create API Key"
4. Nom: "Scobe Password Reset"
5. Permission: "Mail Send" ✓
6. Copiez la clé (commence par "SG.")
7. ✅ Clé obtenue
```

---

## 💻 Étape 4: Configuration Supabase

### Option A: Automatique (Windows) ⚡ LE PLUS FACILE

Ouvrez PowerShell et exécutez:

```powershell
PowerShell -ExecutionPolicy Bypass -File setup-email.ps1
```

Le script vous posera:
- Quel service? (1 ou 2)
- Votre clé API?

→ **Tout le reste se fait automatiquement ! ✅**

---

### Option B: Manuel (Toutes Plateformes)

Ouvrez votre Terminal/PowerShell:

```bash
# Ajouter la clé API à Supabase
supabase secrets set RESEND_API_KEY="re_votre_clé_ici"

# OU pour SendGrid
supabase secrets set SENDGRID_API_KEY="SG.votre_clé_ici"

# Déployer la fonction
supabase functions deploy send-reset-code

# Attendre 30-60 secondes...
```

**Vérifiez le statut:**
```bash
supabase functions list
```

Vous devriez voir `send-reset-code` avec status "Active"

---

## ✅ Étape 5: Tester

1. **Ouvrez votre app:**
   ```
   http://localhost:5173/forgot-password
   ```

2. **Entrez votre email:**
   ```
   Votre adresse email: user@example.com
   ```

3. **Cliquez "Envoyer un code"**
   ```
   Attendre 1-2 secondes...
   ```

4. **Vérifiez votre email:**
   ```
   Inbox → Vous devriez voir un email de "Scobe"
   Subject: "Réinitialisez votre mot de passe Scobe"
   ```

5. **Copier le code:**
   ```
   Code: 123456 (6 chiffres)
   ```

6. **Retourner sur la page et entrer le code:**
   ```
   Formulaire pas → Coller le code
   ```

7. **Entrer nouveau mot de passe:**
   ```
   Nouveau mot de passe: _________
   Confirmer: _________
   ```

8. **Cliquez "Réinitialiser le mot de passe"**
   ```
   ✅ Succès! Redirection vers login
   ```

---

## 🐛 Si ça ne marche pas

### Email non reçu
```
1. Vérifier Spam/Junk
2. Attendre 30 secondes
3. Vérifier la clé API est correcte
4. Redéployer: supabase functions deploy send-reset-code
```

### Erreur en terminal
```
1. Copier le message d'erreur
2. Vérifier: supabase functions show send-reset-code
3. Vérifier: supabase secrets list
```

### Clé API rejetée
```
1. Vérifier commence par "re_" (Resend) ou "SG." (SendGrid)
2. Pas de copie-collage d'espace supplémentaire
3. Recréer une nouvelle clé API
```

---

## 📞 Besoin d'Aide?

**Lire les guides complets:**
- `EMAIL_SETUP_README.md` - Guide complet
- `EDGE_FUNCTION_DEPLOYMENT.md` - Guide technique
- `EMAIL_SETUP_QUICK.md` - Résumé

**Tester localement:**
```bash
supabase functions serve
```

**Voir les logs:**
```bash
supabase functions show send-reset-code
```

---

## 🎉 C'est Terminé !

Une fois que vous recevez l'email, tout fonctionne:
- ✅ Code généré automatiquement
- ✅ Email envoyé automatiquement
- ✅ Réinitialisation mot de passe fonctionnelle
- ✅ Sécurité complète

---

## ⏱️ Temps Total

| Task | Durée |
|------|-------|
| Créer compte email | 2 min |
| Obtenir clé API | 1 min |
| Setup Supabase | 2 min |
| Test | 2 min |
| **Total** | **7 min** |

---

## 🎁 Bonus: Que Faire Maintenant?

### Immédiat:
- ✅ Tester le flux complet
- ✅ Vérifier email reçu
- ✅ Tester nouveau mot de passe

### Court terme:
- Configurer domaine personnalisé (optionnel)
- Ajouter animations login
- Tester sur mobile

### Moyen terme:
- Ajouter rate limiting
- Ajouter CAPTCHA
- Analytics d'authentification

---

## 🔗 Liens Utiles

- https://resend.com
- https://sendgrid.com
- https://supabase.com/docs/guides/functions

---

**Status:** 🚀 Prêt à démarrer!

**Prochaine étape:** Exécuter `setup-email.ps1` OU suivre les étapes manuel

**Durée setup:** ~5-10 minutes

🎉 **Allez-y!**

