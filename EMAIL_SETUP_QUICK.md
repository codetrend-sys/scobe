# Configuration Email - Ajouter à .env ou Supabase Secrets

## 🚀 Pour démarrer

Vous avez deux choix:

### Option 1: Resend.com (RECOMMANDÉE - Plus facile)

1. Créez un compte sur https://resend.com
2. Obtenez votre clé API (commence par `re_`)
3. Ajoutez à Supabase:

```bash
supabase secrets set RESEND_API_KEY="re_votre_clé_ici"
```

### Option 2: SendGrid

1. Créez un compte sur https://sendgrid.com
2. Obtenez votre clé API (commence par `SG.`)
3. Ajoutez à Supabase:

```bash
supabase secrets set SENDGRID_API_KEY="SG.votre_clé_ici"
```

---

## 📋 Checklist Rapide

- [ ] Installer Supabase CLI: `npm install -g supabase`
- [ ] Se connecter: `supabase login`
- [ ] Créer compte Resend ou SendGrid
- [ ] Obtenir la clé API
- [ ] Exécuter la commande `supabase secrets set ...`
- [ ] Déployer la fonction: `supabase functions deploy send-reset-code`
- [ ] Tester sur la page `/forgot-password`
- [ ] Vérifier que l'email arrive

---

## ✨ Après le déploiement

- L'email sera envoyé automatiquement
- Le code sera valable 15 minutes
- Les utilisateurs recevront un email formaté
- Pas de besoin de faire quoi que ce soit manuellement

---

**Durée totale**: ~5 minutes
**Difficulté**: ⭐ Facile

Besoin d'aide? Voir `EDGE_FUNCTION_DEPLOYMENT.md`

