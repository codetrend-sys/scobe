
# Système d'Authentification Utilisateur et Favoris avec Supabase

## 📋 Fichiers créés

### 1. **UserAuthContext.jsx** (`src/context/UserAuthContext.jsx`)
- Gère l'authentification utilisateur (signup, login, logout)
- Changement et réinitialisation de mot de passe
- Récupération du profil utilisateur

### 2. **FavoritesContext.jsx** (modifié)
- Intégration avec Supabase au lieu de localStorage
- Synchronisation automatique des favoris lors de la connexion
- Opérations CRUD sur les favoris

### 3. **Pages créées**

#### `Login.jsx` (modifié)
- Page de connexion pour les utilisateurs
- Interface améliorée avec validation
- Lien vers inscription et mot de passe oublié

#### `SignUp.jsx`
- Page d'inscription pour créer un compte
- Validation des données
- Confirmation de mot de passe

#### `ChangePassword.jsx`
- Page pour changer le mot de passe
- Sécurisation avec confirmation
- Validation des mots de passe

#### `Favorites.jsx` (modifié)
- Affichage des favoris stockés dans Supabase
- Modal de confirmation avant suppression
- Intégration avec le panier

### 4. **RequireUserAuth.jsx**
- Composant de protection des routes
- Redirige vers login si non authentifié
- Affiche un écran de chargement

### 5. **SQL Setup** (`user-auth-setup.sql`)
- Crée la table `user_profiles`
- Crée la table `favorites`
- Configure les Row Level Security (RLS)
- Crée un trigger pour l'auto-création de profil

---

## ⚙️ Étapes d'intégration

### Étape 1: Exécuter les migrations SQL

Connectez-vous à votre dashboard Supabase et exécutez le contenu de `user-auth-setup.sql` dans l'éditeur SQL.

```bash
# Contenu du fichier user-auth-setup.sql
```

### Étape 2: Mettre à jour App.jsx

```jsx
import { UserAuthProvider } from './context/UserAuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import RequireUserAuth from './components/RequireUserAuth';
import Login from './components/pages/Login';
import SignUp from './components/pages/SignUp';
import ChangePassword from './components/pages/ChangePassword';
import Favorites from './components/pages/Favorites';

// Dans votre main App component:
<UserAuthProvider>
  <FavoritesProvider>
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Routes protégées */}
      <Route 
        path="/favoris" 
        element={
          <RequireUserAuth>
            <Favorites />
          </RequireUserAuth>
        } 
      />
      <Route 
        path="/change-password" 
        element={
          <RequireUserAuth>
            <ChangePassword />
          </RequireUserAuth>
        } 
      />
      
      {/* Autres routes... */}
    </Routes>
  </FavoritesProvider>
</UserAuthProvider>
```

### Étape 3: Mettre à jour le header/navbar

Ajoutez des liens de navigation pour les utilisateurs:

```jsx
import { useUserAuth } from '../context/UserAuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useUserAuth();

  return (
    <header>
      {/* ... autres éléments ... */}
      
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span>Bonjour, {user?.email}</span>
          <a href="/favoris">❤️ Mes Favoris</a>
          <a href="/change-password">🔒 Changer mot de passe</a>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <a href="/login">Se connecter</a>
          <a href="/signup">S'inscrire</a>
        </div>
      )}
    </header>
  );
}
```

### Étape 4: Mettre à jour les pages de produits

Pour ajouter/retirer les favoris sur les pages produit:

```jsx
import { useFavorites } from '../context/FavoritesContext';
import { useUserAuth } from '../context/UserAuthContext';

export function ProductCard({ product }) {
  const { isAuthenticated } = useUserAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      // Rediriger vers login
      return;
    }
    await toggleFavorite(product);
  };

  return (
    <div>
      <button
        onClick={handleAddFavorite}
        className={isFavorite(product.id) ? 'text-red-500' : 'text-gray-400'}
      >
        ❤️
      </button>
      {/* ... reste du composant ... */}
    </div>
  );
}
```

---

## 🔐 Flux d'authentification

### Inscription
1. Utilisateur remplit le formulaire SignUp
2. Les données sont envoyées à Supabase Auth
3. Un email de confirmation est envoyé
4. Le profil utilisateur est créé automatiquement (trigger)
5. Utilisateur confirmé → peut se connecter

### Connexion
1. Utilisateur entre email et mot de passe
2. Vérification par Supabase Auth
3. Session créée
4. Favoris chargés depuis la base de données
5. Accès aux pages protégées

### Changement de mot de passe
1. Utilisateur doit être connecté
2. Entre le nouveau mot de passe
3. Mis à jour dans Supabase Auth
4. Session maintenue

---

## 📊 Structure de la base de données

### Table: `user_profiles`
```
- id: UUID (référence auth.users)
- email: TEXT (unique)
- full_name: TEXT
- phone: TEXT
- address: TEXT
- city: TEXT
- postal_code: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `favorites`
```
- id: UUID (clé primaire)
- user_id: UUID (référence auth.users)
- product_id: TEXT
- product_name: TEXT
- product_price: DECIMAL
- product_image_url: TEXT
- category: TEXT
- rating: DECIMAL
- created_at: TIMESTAMP
- UNIQUE(user_id, product_id)
```

---

## 🔒 Sécurité - Row Level Security (RLS)

Chaque utilisateur ne peut:
- ✅ Voir son propre profil
- ✅ Modifier son propre profil
- ✅ Voir ses propres favoris
- ✅ Ajouter/supprimer ses propres favoris
- ❌ Voir les données d'autres utilisateurs

---

## ⚡ Fonctionnalités

### UserAuthContext
- `signup(email, password, fullName)` - S'inscrire
- `login(email, password)` - Se connecter
- `logout()` - Se déconnecter
- `changePassword(newPassword)` - Changer le mot de passe
- `resetPassword(email)` - Réinitialiser le mot de passe
- `getUserProfile()` - Récupérer le profil

### FavoritesContext
- `addFavorite(product)` - Ajouter aux favoris
- `removeFavorite(productId)` - Retirer des favoris
- `toggleFavorite(product)` - Basculer favori
- `isFavorite(productId)` - Vérifier si c'est un favori
- `fetchFavorites()` - Recharger les favoris

---

## 🐛 Dépannage

### "Email déjà utilisé"
- L'email existe déjà dans Supabase Auth
- Proposez à l'utilisateur de se connecter ou de réinitialiser le mot de passe

### "Session expirée"
- L'utilisateur doit se reconnecter
- La session dure généralement 1 heure

### Favoris ne se synchronisent pas
- Vérifiez que l'utilisateur est authentifié
- Vérifiez les logs Supabase pour les erreurs RLS
- Assurez-vous que les tables existent

---

## 📝 Notes importantes

1. **Email de confirmation**: Les utilisateurs doivent confirmer leur email avant de se connecter complètement
2. **RLS obligatoire**: Ne désactivez pas RLS en production
3. **Mot de passe actuel**: Supabase ne permet pas de vérifier l'ancien mot de passe directement
4. **JWT tokens**: Stockés automatiquement par Supabase dans les cookies sécurisés

---

## 🚀 Prochaines étapes (optionnel)

- [ ] Authentification OAuth (Google, GitHub)
- [ ] Profil utilisateur modifiable
- [ ] Avatar utilisateur
- [ ] Notifications préférences
- [ ] Historique des commandes
- [ ] Intégration avec le système de commandes existant

