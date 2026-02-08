# Déploiement Vercel + Hostinger — Guide rapide

Ce fichier liste les variables d'environnement à ajouter dans Vercel, les commandes de build, et les étapes DNS à effectuer chez Hostinger.

## 1) Pré-requis
- Compte Vercel et compte Hostinger (accès au panneau DNS)
- Dépot Git connecté à Vercel (GitHub/GitLab/Bitbucket)

## 2) Variables d'environnement (à ajouter dans Vercel)
Ajoutez ces variables dans Project → Settings → Environment Variables.

- `SUPABASE_URL` = https://xxxx.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = <nouvelle_service_role_key>  (SECRET, **ne pas** préfixer par `VITE_`)
- `VITE_SUPABASE_ANON_KEY` = <anon_public_key> (publique côté client si besoin)
- `VITE_SUPABASE_URL` = same as `SUPABASE_URL` (si le client doit connaître l'URL)

Autres secrets (ex : SMTP) : ajoutez-les sans `VITE_` et marquez-les comme `Production`/`Preview` selon usage.

## 3) Paramètres de build Vercel
- Build Command: `npm run build`
- Output Directory: `dist` (Vite par défaut)

Fichiers serverless: placez les fonctions Node dans `/api/*` (ex: `api/reset-password.js`). Ces fichiers peuvent lire `process.env`.

## 4) Déployer depuis la CLI (optionnel)
```bash
npx vercel login
npx vercel --prod
```

Pour ajouter une variable via CLI:
```bash
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## 5) Tester localement
- Lancer le front: `npm run dev`
- Simuler Vercel: `npx vercel dev`
- Tester l'API (exemple):
```bash
curl -X POST http://localhost:3000/api/reset-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","code":"1234","newPassword":"NewPass123"}'
```

## 6) Ajouter domaine personnalisé (Vercel) et config DNS Hostinger
1. Dans Vercel: Project → Domains → Add Domain → `votredomaine.com`
2. Vercel affichera les enregistrements DNS à ajouter. Typiquement:
   - Apex (`votredomaine.com`): A → `76.76.21.21` (Vercel)
   - `www`: CNAME → `cname.vercel-dns.com.` (Vercel fournit la cible exacte)
   - Parfois un TXT pour vérification — copiez la valeur fournie.
3. Chez Hostinger: ouvrez **DNS Zone Editor** pour votre domaine et ajoutez/éditez les enregistrements fournis par Vercel.
4. Attendez la propagation et laissez Vercel valider le domaine (dashboard indiquera `Verified`/`Active`).

## 7) HTTPS / SSL
Vercel émet automatiquement un certificat Let's Encrypt pour le domaine une fois les DNS pointés correctement.

## 8) Vérifications post-déploiement
- Ouvrir l'URL publique et vérifier l'app.
- Tester l'API via `https://votredomaine.com/api/reset-password`.
- Consulter les logs Vercel (Project → Functions → Logs) pour détecter erreurs.

## 9) Sécurité & conseils
- Ne jamais exposer de `SERVICE_ROLE_KEY` côté client. Si elle a été poussée, **révoquez-la** et remplacez-la.
- Ajoutez `.env` à `.gitignore` et retirez `*.env` du cache git :
  ```bash
  echo .env >> .gitignore
  git rm --cached .env
  git commit -m "Remove .env from repo"
  git push
  ```
- Pour purger une clé dans l'historique git (option avancée) utilisez `git filter-repo` ou `bfg` après sauvegarde.

## 10) Contacts & aide
Si vous voulez, je peux:
- générer automatiquement le commit pour `.gitignore` et retirer `.env` du cache git,
- ou convertir d'autres endpoints en `/api` compatibles Vercel.

Fin du guide rapide.
