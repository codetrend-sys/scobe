# Migration vers Supabase

Ce guide explique comment migrer tes données de `data.js` vers Supabase.

## 📋 Prérequis

1. Un compte Supabase (gratuit) : https://supabase.com
2. Un projet Supabase créé

## 🚀 Étapes de migration

### 1. Configurer Supabase

1. Va sur https://supabase.com et crée un projet (ou utilise un existant)
2. Dans le Dashboard de ton projet Supabase :
   - Va dans **Settings > API**
   - Copie l'**URL** et la **anon/public key**

### 2. Configurer les variables d'environnement

Ouvre le fichier `.env` à la racine du projet et remplace :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-cle-anon-ici
```

### 3. Créer les tables dans Supabase

1. Dans le Dashboard Supabase, va dans **SQL Editor**
2. Clique sur **New Query**
3. Copie-colle le contenu du fichier `supabase-schema.sql`
4. Clique sur **Run** pour exécuter le script

Cela créera les tables :
- `categories`
- `subcategories`
- `products`

### 4. Exporter les données en JSON (avec images)

Avant de migrer, tu dois exporter les données de `data.js` en JSON car Node.js ne peut pas importer directement les fichiers avec des imports d'images.

**Important :** Le script d'export convertit automatiquement **toutes les images en DataURL**, ce qui permet de migrer toutes les données sans perte.

1. Lance ton application : `npm run dev`
2. Ouvre dans ton navigateur : `http://localhost:5173/export-data.html`
3. Clique sur **"Exporter les données (avec images)"**
4. Attends la fin de la conversion (barre de progression)
5. Le fichier `data.json` sera téléchargé automatiquement avec toutes les images converties en DataURL
6. Place ce fichier à la **racine du projet** (même niveau que `package.json`)

**Note :** La conversion peut prendre quelques minutes selon le nombre d'images. Les DataURL sont des chaînes de caractères qui contiennent l'image encodée en base64, donc elles peuvent être stockées directement dans Supabase.

### 5. Migrer les données

Une fois `data.json` créé, lance le script de migration :

```bash
node scripts/migrate-to-supabase.js
```

Le script va :
- Charger les données depuis `data.json`
- Insérer toutes les catégories dans Supabase
- Insérer toutes les sous-catégories avec leurs relations
- Insérer tous les produits avec leurs relations
- Afficher un résumé de la migration

### 6. Vérifier la migration

1. Va dans **Table Editor** dans Supabase
2. Vérifie que les tables contiennent bien tes données :
   - `categories` : doit contenir toutes tes catégories
   - `subcategories` : doit contenir toutes tes sous-catégories
   - `products` : doit contenir tous tes produits

## ✅ Utilisation

Une fois la migration terminée, ton application utilisera automatiquement Supabase au lieu de `localStorage`.

- Si Supabase est configuré : les données viennent de Supabase
- Si Supabase n'est pas configuré : fallback sur `data.js` local

## 🔧 Dépannage

### Erreur : "Supabase non configuré"
- Vérifie que `.env` contient bien `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- Redémarre le serveur de développement après modification de `.env`

### Erreur : "Le fichier data.json n'existe pas"
- Assure-toi d'avoir exporté les données via `export-data.html` (étape 4)
- Vérifie que `data.json` est bien à la racine du projet

### Erreur lors de la migration
- Vérifie que les tables existent dans Supabase (étape 3)
- Vérifie que les variables d'environnement sont correctes
- Vérifie que `data.json` est valide (format JSON correct)
- Vérifie les logs dans la console pour plus de détails

### Les données ne s'affichent pas
- Vérifie que les politiques RLS (Row Level Security) permettent la lecture
- Par défaut, les politiques permettent la lecture publique
- Pour l'écriture, tu devras créer des politiques basées sur ton système d'auth admin

## 📝 Notes importantes

- **Toutes les images sont converties en DataURL** lors de l'export, ce qui permet de migrer toutes les données sans perte
- Les DataURL sont des chaînes de caractères encodées en base64 qui peuvent être stockées directement dans Supabase
- Les IDs seront générés automatiquement par Supabase (ne correspondront pas aux IDs originaux)
- Les relations entre catégories, sous-catégories et produits sont préservées via les clés étrangères
- Le fichier `data.json` peut être volumineux (plusieurs Mo) à cause des images en DataURL, c'est normal
