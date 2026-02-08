# Guide de Déploiement - Function Email de Réinitialisation

## 📧 Configuration Email

La fonction Edge `send-reset-code` envoie automatiquement le code de réinitialisation par email à l'utilisateur.

### Option 1: Resend (Recommandée - Gratuite)

Resend est le service recommandé par Supabase. Il est gratuit jusqu'à 100 emails/jour.

#### Étapes:

1. **Créer un compte Resend**
   - Allez sur https://resend.com
   - Créez un compte gratuit
   - Confirmez votre email

2. **Obtenir la clé API**
   - Dans le dashboard Resend, allez à "API Keys"
   - Créez une nouvelle clé API
   - Copiez la clé (commence par `re_`)

3. **Ajouter la clé à Supabase**
   ```bash
   # Option A: Via CLI Supabase (Recommandé)
   supabase secrets set RESEND_API_KEY="re_votre_clé_ici"
   
   # Option B: Via Supabase Dashboard
   # 1. Allez à Project Settings > Secrets
   # 2. Cliquez sur "New Secret"
   # 3. Nom: RESEND_API_KEY
   # 4. Valeur: re_votre_clé_ici
   # 5. Cliquez "Add Secret"
   ```

4. **Déployer la fonction**
   ```bash
   cd C:\Users\NISSRIN\OneDrive\Desktop\scobe
   supabase functions deploy send-reset-code
   ```

5. **Vérifier le déploiement**
   ```bash
   supabase functions list
   # Vous devriez voir: send-reset-code
   ```

#### Configuration du domaine d'envoi:
- Resend fournit un domaine par défaut: `onboarding@resend.dev`
- Pour utiliser un domaine personnalisé (comme `noreply@scobe.fr`):
  1. Allez à "Domains" dans Resend
  2. Ajoutez vos enregistrements DNS
  3. Vérifiez le domaine
  4. Utilisez le domaine dans la fonction

---

### Option 2: SendGrid (Alternative)

SendGrid offre 100 emails gratuits/jour.

#### Étapes:

1. **Créer un compte SendGrid**
   - Allez sur https://sendgrid.com
   - Créez un compte gratuit
   - Confirmez votre email

2. **Obtenir la clé API**
   - Dans le dashboard, allez à "Settings > API Keys"
   - Créez une nouvelle clé API
   - Sélectionnez "Restricted Access"
   - Accordez la permission "Mail Send"
   - Copiez la clé (commence par `SG.`)

3. **Ajouter la clé à Supabase**
   ```bash
   # Option A: Via CLI Supabase
   supabase secrets set SENDGRID_API_KEY="SG.votre_clé_ici"
   
   # Option B: Via Supabase Dashboard
   # Pareil que Resend (voir étapes ci-dessus)
   ```

4. **Vérifier l'adresse d'envoi**
   - SendGrid requiert que l'adresse d'envoi soit vérifiée
   - Allez à "Settings > Sender Authentication"
   - Vérifiez votre domaine ou adresse email

5. **Déployer la fonction**
   ```bash
   supabase functions deploy send-reset-code
   ```

---

## 🚀 Installation - Prérequis

Avant de déployer, assurez-vous d'avoir:

1. **Supabase CLI installé**
   ```bash
   npm install -g supabase
   ```

2. **Deno installé** (optionnel, pour tester localement)
   ```bash
   irm https://deno.land/install.ps1 | iex
   ```

3. **Configuré le projet Supabase**
   ```bash
   supabase login
   supabase projects list
   ```

---

## 📦 Fichiers

La fonction est organisée comme suit:

```
supabase/
└── functions/
    └── send-reset-code/
        ├── index.ts          ← Code principal de la fonction
        └── deno.json         ← Configuration Deno
```

---

## 🧪 Test local

Avant de déployer en production:

```bash
# Tester localement avec Supabase CLI
supabase functions serve

# Dans un autre terminal, tester l'endpoint:
curl -X POST http://localhost:54321/functions/v1/send-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

---

## ✅ Vérifier le déploiement

Une fois déployée, vérifiez que tout fonctionne:

1. **Via Supabase Dashboard**
   - Allez à "Functions"
   - Vous devriez voir `send-reset-code`
   - Vérifiez que le statut est "Active"

2. **Via CLI**
   ```bash
   supabase functions list
   supabase functions show send-reset-code
   ```

3. **Tester depuis l'app**
   - Allez à `/forgot-password`
   - Entrez un email
   - Vérifiez votre inbox
   - Vous devriez recevoir un email avec le code

---

## 📧 Format de l'email

L'email envoyé contient:
- Objet: "Réinitialisez votre mot de passe Scobe"
- Expéditeur: `noreply@scobe.fr` (ou le domaine configuré)
- Corps: HTML formaté avec le code

Exemple:
```
Le code: 123456
Durée: 15 minutes
```

---

## 🔐 Variables d'environnement

```bash
# Resend
RESEND_API_KEY=re_...

# SendGrid
SENDGRID_API_KEY=SG....

# Les deux peuvent être configurées en même temps
# La fonction utilisera la première disponible (Resend prioritaire)
```

---

## 🐛 Dépannage

### L'email ne s'envoie pas

**Problème**: "Aucun service d'email configuré"
- **Solution**: Vérifiez que `RESEND_API_KEY` ou `SENDGRID_API_KEY` est défini dans Supabase

**Problème**: "Erreur lors de l'envoi d'email"
- **Solution**: 
  - Vérifiez la clé API est correcte
  - Vérifiez l'adresse d'envoi est vérifiée chez Resend/SendGrid
  - Consultez les logs: `supabase functions show send-reset-code`

**Problème**: Email reçu dans les spams
- **Solution**:
  - Marquez comme "Not spam" dans votre email
  - Améliorez c'authentification SPF/DKIM/DMARC (advanced)

### La fonction n'est pas déployée

**Problème**: "Function not found"
- **Solution**: 
  ```bash
  supabase functions deploy send-reset-code
  ```

### Code toujours affiché dans console

- C'est voulu pendant les tests
- Supprimez les `console.log` en production
- L'email est la source de vérité

---

## 🎯 Flux complet

1. Utilisateur va à `/forgot-password`
2. Rentre son email
3. Frontend: génère le code + stocke en DB
4. Frontend: appelle Edge Function `send-reset-code`
5. Edge Function: envoie email via Resend/SendGrid
6. Utilisateur: reçoit l'email avec le code
7. Utilisateur: entre le code sur la page
8. Frontend: valide le code
9. Frontend: met à jour le mot de passe
10. ✅ Succès!

---

## 📊 Quotas gratuits

| Service | Limite | Prix après |
|---------|--------|-----------|
| Resend | 100 emails/jour | $0.10-0.20 par 1000 |
| SendGrid | 100 emails/mois | $10-20/mois |

---

## 🔗 Ressources

- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Personnaliser l'email](../PASSWORD_RESET_EMAIL_SETUP.md)

---

## ✨ Prochaines étapes

1. ✅ Déployer la fonction Edge
2. ✅ Configurer la clé API (Resend ou SendGrid)
3. ✅ Tester le flux complet
4. ✅ Monitorer les logs et erreurs
5. Optionnel: Configurer le domaine personnalisé

---

**Temps estimé**: 5-10 minutes pour la configuration initiale
**Complexité**: Facile ✨

