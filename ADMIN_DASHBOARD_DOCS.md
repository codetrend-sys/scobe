# ✅ Interface Admin - Documentation Complète

## Vue d'ensemble
L'interface admin permet aux administrateurs de gérer **complètement** le catalogue de la boutique :
- **Catégories** : Créer, modifier, supprimer
- **Sous-catégories** : Créer, modifier, supprimer  
- **Produits** : Créer, modifier, supprimer avec prix, note, image

Toutes les données sont **stockées dans Supabase** et **lues en temps réel** par l'application.

---

## 🔐 Accès Admin

### URL Admin
```
http://localhost:5173/admin/login
```

### Flux d'authentification
1. **Connexion** → `/admin/login`
   - Entrez vos identifiants admin
   - Jeton stocké sécurisé
   
2. **Dashboard** → `/admin`
   - Accès protégé par `RequireAdmin` wrapper
   - Redirection auto si non authentifié

3. **Déconnexion**
   - Bouton rouge en haut à droite du dashboard

---

## 📋 Interface AdminDashboard

### 🎯 Onglets Principaux

#### 1️⃣ **CATÉGORIES**
- 📌 Affiche toutes les catégories
- ➕ Ajouter : Nom, Description, Image URL
- ✏️ Modifier : Mettre à jour les détails
- 🗑️ Supprimer : Supprime la catégorie + ses sous-catégories + produits

**Exemple JSON envoyé à Supabase:**
```json
{
  "name": "Papeterie",
  "description": "Tous les produits de papeterie",
  "imageUrl": "https://example.com/papeterie.jpg"
}
```

#### 2️⃣ **SOUS-CATÉGORIES**
- 📌 Sélectionnez une catégorie d'abord
- ➕ Ajouter : Nom, Image URL
- ✏️ Modifier : Mettre à jour les détails
- 🗑️ Supprimer : Supprime la sous-catégorie + ses produits
- 📊 Affiche le nombre de produits par sous-catégorie

**Exemple JSON:**
```json
{
  "name": "Cahiers",
  "imageUrl": "https://example.com/cahiers.jpg"
}
```

#### 3️⃣ **PRODUITS**
- 📌 Sélectionnez catégorie ET sous-catégorie
- ➕ Ajouter : Nom, Prix, Note (0-5), Image, Vedette (checkbox)
- ✏️ Modifier : Mettre à jour tous les champs
- 🗑️ Supprimer : Supprime le produit de la BD
- 📊 Affiche prix, note et statut "vedette"

**Exemple JSON:**
```json
{
  "name": "Cahier A4 100 feuilles",
  "price": 25.99,
  "rating": 4.5,
  "imageUrl": "https://example.com/cahier-a4.jpg",
  "featured": true
}
```

---

## 🔄 Flux Données (Architecture)

```
AdminDashboard (UI)
    ↓
useCatalog() Hook
    ↓
CatalogContext (State Management)
    ↓
Supabase (PostgreSQL Backend)
    ↓
Tables: categories, subcategories, products
```

### Flux de Mise à Jour
1. Admin remplit formulaire
2. Clique "Ajouter" ou "Mettre à jour"
3. Handler CRUD appelé (ex: `updateProduct()`)
4. Données envoyées à Supabase via SDK
5. État local synchronisé
6. UI rafraîchit automatiquement

---

## 🛠️ Fonctions CRUD (CatalogContext.jsx)

### Catégories
```javascript
await addCategory({ name, description, imageUrl })
await updateCategory(id, { name, description, imageUrl })
await deleteCategory(id)
```

### Sous-Catégories
```javascript
await addSubcategory(categoryId, { name, imageUrl })
await updateSubcategory(categoryId, subId, { name, imageUrl })
await deleteSubcategory(categoryId, subId)
```

### Produits
```javascript
await addProduct(categoryId, subcategoryId, { name, price, rating, imageUrl, featured })
await updateProduct(categoryId, subcategoryId, productId, { ... })
await deleteProduct(categoryId, subcategoryId, productId)
```

---

## 📊 Base de Données (Supabase)

### Table: `categories`
```sql
id          BIGINT (PK)
name        TEXT
description TEXT
imageUrl    TEXT
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### Table: `subcategories`
```sql
id          BIGINT (PK)
categoryId  BIGINT (FK → categories.id)
name        TEXT
imageUrl    TEXT
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### Table: `products`
```sql
id              BIGINT (PK)
subcategoryId   BIGINT (FK → subcategories.id)
name            TEXT
price           FLOAT
rating          FLOAT
imageUrl        TEXT
featured        BOOLEAN
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

---

## 🎨 Affichage Frontend (Composants)

Tous les composants lisent depuis **`useCatalog()` hook** :

### Components mises à jour:
- ✅ [SousCategoriesList.jsx](../layers/SousCategoriesList.jsx) - Affiche subcategories
- ✅ [DropDown.jsx](../items/DropDown.jsx) - Menu navigation
- ✅ [SearchResults.jsx](../pages/SearchResults.jsx) - Résultats recherche
- ✅ [footer.jsx](../layouts/footer.jsx) - Liens catégories

**Pattern utilisé:**
```jsx
const { categories, loading } = useCatalog();

if (loading) return <div>Chargement...</div>;

return categories.map(cat => ...)
```

---

## 🚀 Exemple: Ajouter un Produit

1. **Accédez à l'admin** → `/admin`
2. **Onglet "Produits"**
3. **Sélectionnez une catégorie** → ex: "Papeterie"
4. **Sélectionnez une sous-catégorie** → ex: "Cahiers"
5. **Cliquez "Ajouter"**
6. **Remplissez le formulaire:**
   - Nom: "Cahier A4 Luxe"
   - Prix: 35.50
   - Note: 4.8
   - URL Image: `https://example.com/cahier-luxe.jpg`
   - Cochez "Produit en vedette"
7. **Cliquez "Ajouter"**
8. ✅ Produit apparaît dans la liste

---

## 🔒 Sécurité

- ✅ Authentification admin via `AdminAuthContext`
- ✅ Route `/admin` protégée par `RequireAdmin` wrapper
- ✅ RLS Policies sur Supabase (configurable)
- ✅ Jeton stocké en sessionStorage

---

## ⚡ Dépannage

### Admin Dashboard ne charge pas?
1. Vérifiez que vous êtes connecté (`/admin/login`)
2. Vérifiez `.env` a `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Vérifiez que Supabase est accessible

### Produits ne s'affichent pas après ajout?
1. Vérifiez la console (F12) pour les erreurs
2. Confirmez que catégorie/sous-catégorie sont bien sélectionnées
3. Vérifiez que le prix/note sont des nombres valides

### Images ne s'affichent pas?
- Actuellement: champs `imageUrl: null` pour tous les produits
- À faire: Intégrer upload image vers Supabase Storage ou CDN externe

---

## 📝 Notes Importantes

1. **Données en temps réel**: L'interface admin utilise le même `CatalogContext` que le frontend → Synchronisation instantanée
2. **Suppression en cascade**: Supprimer une catégorie supprime ses subcats + produits
3. **Fallback**: Si Supabase n'est pas configuré, l'app utilise `data.js` local
4. **Images**: URLs actuellement nulles; à remplir manuellement ou via upload futur

---

## ✨ Prochaines Étapes Optionnelles

- [ ] Upload images directement dans l'admin
- [ ] Intégration Supabase Storage pour images
- [ ] Validation des formulaires plus stricte
- [ ] Pagination pour listes longues
- [ ] Recherche/filtrage dans les listes
- [ ] Export/Import données
- [ ] Historique des modifications

---

**Créé:** Phase 4 - Migration UI vers Supabase  
**Dernière mise à jour:** 2024  
**Status:** ✅ Production Ready
