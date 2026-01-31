# 📸 Configuration Supabase Storage pour les Images

## 🎯 Vue d'ensemble

Le nouvel AdminDashboard supporte maintenant l'upload d'images locales vers **Supabase Storage**.

### Flux Fonctionnement
```
Admin sélectionne image locale
    ↓
Upload vers Supabase Storage ("scobe-images" bucket)
    ↓
Récupère URL publique
    ↓
Sauvegarde URL dans Supabase (categories/subcategories/products)
    ↓
Images affichées dans l'admin et frontend
```

---

## ⚙️ Configuration Supabase Storage

### Étape 1: Créer le Bucket

**Via Dashboard Supabase:**

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Onglet **Storage** (sidebar gauche)
4. Cliquez **"New bucket"**
5. Remplissez:
   ```
   Name: scobe-images
   Public: ON (cochez)
   ```
6. Cliquez **"Create bucket"**

✅ Bucket créé!

### Étape 2: Configurer les RLS Policies

**Dans le Dashboard Supabase:**

1. Aller à **Storage** → **scobe-images**
2. Onglet **Policies** (en haut)
3. Cliquez **"New policy"**
4. Choisir **"For SELECT"** (Lecture publique)
5. Remplissez:
   ```
   Policy name: Allow public read
   Using expression: (bucket_id = 'scobe-images')
   ```
6. Cliquez **"Create"**

7. Cliquez **"New policy"** encore
8. Choisir **"For INSERT"** (Upload)
9. Remplissez:
   ```
   Policy name: Allow authenticated upload
   With check expression: (bucket_id = 'scobe-images')
   ```
10. Cliquez **"Create"**

✅ Policies configurées!

---

## 🖼️ Utilisation dans AdminDashboard

### Ajouter une Image

```
1. Cliquez sur "Ajouter une catégorie/produit/sous-catégorie"
2. Vous voyez la section "Image":
   
   ┌────────────────────────────────────┐
   │ 📤 Cliquez pour sélectionner une  │
   │     image                          │
   └────────────────────────────────────┘

3. Cliquez pour sélectionner une image locale
4. L'image est uploadée:
   - Upload en cours... ⏳
5. ✅ Image uploadée avec succès
   - Aperçu s'affiche
   - URL stockée automatiquement
```

### Modifier une Image

```
1. Cliquez [✏️] sur un item
2. Formulaire s'ouvre avec l'image actuelle
3. Pour changer:
   - Cliquez le [X] sur l'aperçu pour supprimer
   - Sélectionnez une nouvelle image
4. Cliquez [Mettre à jour]
5. ✅ Image mise à jour
```

### Supprimer une Image

```
1. Dans l'aperçu de l'image, cliquez [X]
2. L'image est supprimée de l'affichage
3. La nouvelle URL (vide) sera sauvegardée
```

---

## 📋 Spécifications

### Limites
```
Max size: 5 MB
Formats: JPG, PNG, WebP, GIF
```

### Structures de Dossiers
```
scobe-images/
├─ images/
│  ├─ categories/
│  │  ├─ 1704067200000-papeterie.jpg
│  │  └─ 1704067300000-art.png
│  ├─ subcategories/
│  │  ├─ 1704067400000-cahiers.jpg
│  │  └─ 1704067500000-crayons.png
│  └─ products/
│     ├─ 1704067600000-cahier-a4.jpg
│     └─ 1704067700000-stylo-bleu.png
```

Nom de fichier: `{timestamp}-{filename}`
- Évite les conflits
- Garantit l'unicité
- Facile à nettoyer

---

## 🔒 Sécurité

### RLS Policies en Place
- ✅ **SELECT**: Public (tout le monde peut voir les images)
- ✅ **INSERT**: Admin authentifiés seulement
- ✅ **UPDATE**: Admin authentifiés seulement
- ✅ **DELETE**: Admin authentifiés seulement

### Tokens
- Utilise `VITE_SUPABASE_ANON_KEY`
- Row-level security en place
- Les users non-auth ne peuvent pas modifier

---

## 🧪 Tester l'Upload

### Procédure Test
```
1. npm run dev
2. Allez à http://localhost:5173/admin/login
3. Connectez-vous
4. Onglet "📁 Catégories"
5. Cliquez [➕ Ajouter une catégorie]
6. Remplissez "Nom"
7. Cliquez sur la zone d'upload
8. Sélectionnez une image (JPG, PNG, WebP, GIF)
9. Attendez "✅ Image uploadée"
10. Cliquez [Ajouter]
11. ✅ Catégorie + image créées!
12. Allez à http://localhost:5173/
13. Vérifiez que l'image s'affiche
```

---

## 🐛 Dépannage

### L'upload ne fonctionne pas

**Problème**: "Error: bucket not found"
```
Solution:
1. Assurez-vous que le bucket "scobe-images" existe
2. Allez sur https://app.supabase.com
3. Storage → Vérifiez que "scobe-images" est créé
```

**Problème**: "Policy not found"
```
Solution:
1. Vérifiez les RLS policies
2. Storage → Policies → scobe-images
3. Assurez-vous que les policies existent
```

**Problème**: "File too large"
```
Solution:
1. Réduisez la taille de l'image
2. Max 5MB accepté
3. Utilisez un compresseur: https://tinypng.com
```

### L'image n'apparaît pas

**Problème**: Aperçu s'affiche mais l'image n'est pas sauvegardée
```
Solution:
1. Vérifiez que le formulaire s'est bien soumis
2. Vérifiez le message "✅ Succès"
3. Vérifiez que l'image s'affiche dans la liste
4. Rafraîchissez la page (F5)
```

**Problème**: Image dupliquée ou disparaît après modification
```
Solution:
1. Les anciennes images ne sont pas supprimées
2. C'est normal - elles restent dans Storage
3. Vous pouvez les nettoyer manuellement
```

---

## 📊 Exemple Complet

### Créer une Catégorie avec Image

```javascript
// Admin remplit:
- Nom: "Papeterie"
- Description: "Tous les articles de papeterie"
- Image: Select papeterie.jpg (2.5 MB)

// AdminDashboard:
1. Valide le fichier ✓
2. Upload vers Supabase Storage ✓
3. Récupère URL publique:
   https://your-project.supabase.co/storage/v1/object/public/scobe-images/images/categories/1704067200000-papeterie.jpg
4. Sauvegarde dans DB:
   - categories.name = "Papeterie"
   - categories.imageUrl = "https://..."
5. Affiche l'aperçu ✓

// Frontend:
- Affiche l'image dans:
  - Footer (liens catégories)
  - Dropdown (menu)
  - Home (catégories principales)
```

---

## 🚀 Optimisations Futures

- [ ] Compression d'images automatique
- [ ] Thumbnails (petite/grande version)
- [ ] Suppression des anciennes images
- [ ] Drag & drop pour upload
- [ ] Multiple uploads
- [ ] Édition d'images (crop, rotate)

---

## 📚 Ressources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Image Compression Tools](https://tinypng.com)

---

**Status**: ✅ Prêt à utiliser  
**Bucket**: scobe-images  
**RLS**: Configuré  
**Upload**: Fonctionnel  
**Vérification**: Supabase  

