Migration des données vers Supabase

But: scobe

Objectif
-------
Transférer toutes les données décrites dans `src/components/data/data.js` vers une table Supabase (`products`, `categories`, `subcategories`).

Pré-requis
---------
- Avoir un projet Vite en fonctionnement (`npm install` puis `npm run dev`).
- Ajouter un fichier `.env` à la racine avec :

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-service-key>
```

- Avoir exécuté le schéma SQL fourni (si nécessaire) : `supabase-schema.sql` (table `categories`, `subcategories`, `products` ou `products` selon le script).

Étapes recommandées (rapide)
---------------------------
1. Démarre ton app Vite :

```bash
npm run dev
```

2. Ouvre dans le navigateur : `http://localhost:5173/export-data.html` puis clique sur "Exporter les données".
   - Cela génère `data.json` (les images seront converties en DataURL quand possible).
   - Place `data.json` à la racine du projet.

3. Lancer le script de migration (depuis la racine du projet) :

```bash
node scripts/migrate-to-supabase.js
```

   - Le script va lire `data.json` et insérer les catégories, sous-catégories et produits dans Supabase.

Options / alternative
---------------------
- Si tu préfères exécuter la migration depuis `data.js` directement, je peux ajouter un script Node supplémentaire qui importe `src/components/data/data.js` et appelle la fonction `migrateToSupabase()` déjà fournie dans le fichier. Note : importer `data.js` côté Node peut nécessiter d'ajouter un petit bundler (esbuild) ou d'exécuter via Vite/SSR. Dis-moi si tu veux que je l'ajoute et je l'implémente.

Dépannage
---------
- Si `.env` n'est pas trouvé, le script se terminera avec une erreur — vérifie les variables.
- Si certaines images ne sont pas converties, elles seront ignorées et logguées.
- Assure-toi d'avoir créé une colonne `external_id` si tu utilises l'upsert avec `external_id` (selon le script). Ajuste le nom de colonne dans le script si nécessaire.

Souhaites-tu que je :
- (A) Ajoute un script Node pour appeler `migrateToSupabase()` depuis `data.js` directement ?
- (B) Exécute une simulation (dry-run) de la migration ici (requiert accès à tes clés Supabase, donc je ne peux pas exécuter sans toi) ?
- (C) Mettre à jour `scripts/migrate-to-supabase.js` pour forcer l'usage de `external_id` et détailler la table `products` ?

Réponse rapide attendue : choisis A, B ou C, ou demande autre chose.
