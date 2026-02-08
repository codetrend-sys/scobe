
# ✅ CHECKLIST - Système d'Authentification Utilisateur

## 📦 Fichiers créés/modifiés

### ✅ Contextes (Context)
- [x] `src/context/UserAuthContext.jsx` - Contexte d'authentification utilisateur
- [x] `src/context/FavoritesContext.jsx` - Contexte des favoris (modifié pour Supabase)

### ✅ Composants
- [x] `src/components/RequireUserAuth.jsx` - Protection des routes utilisateur

### ✅ Pages
- [x] `src/components/pages/Login.jsx` - Connexion (modifié)
- [x] `src/components/pages/SignUp.jsx` - Inscription (nouveau)
- [x] `src/components/pages/ChangePassword.jsx` - Changement de mot de passe (nouveau)
- [x] `src/components/pages/Favorites.jsx` - Favoris (modifié)

### ✅ SQL & Configuration
- [x] `user-auth-setup.sql` - Migrations de base de données
- [x] `USER_AUTH_SETUP.md` - Documentation complète
- [x] `APP_EXAMPLE.jsx` - Exemple de configuration App.jsx

---

## 🚀 ÉTAPES À SUIVRE

### Étape 1: Setup Supabase (10 minutes)
```
1. Ouvrir https://app.supabase.com
2. Aller dans le projet
3. Cliquer sur "SQL Editor"
4. Créer une nouvelle query
5. Copier/Coller le contenu de `user-auth-setup.sql`
6. Exécuter la query
7. Vérifier que les tables sont créées
```

✅ Vérification:
- [ ] Table `user_profiles` créée
- [ ] Table `favorites` créée
- [ ] RLS activé sur les deux tables
- [ ] Indexes créés
- [ ] Trigger créé

---

### Étape 2: Mettre à jour App.jsx (5 minutes)
```
1. Ouvrir src/App.jsx
2. Remplacer le contenu avec APP_EXAMPLE.jsx
3. Adapter les imports si nécessaire
4. Vérifier les chemins relatifs
```

✅ Vérification:
- [ ] UserAuthProvider enveloppe l'app
- [ ] FavoritesProvider enveloppe l'app
- [ ] RequireUserAuth utilisé pour /favoris
- [ ] Routes affichées correctement

---

### Étape 3: Activer la confirmation d'email (optionnel mais recommandé)
```
1. Aller dans Supabase Dashboard
2. Authentication → Email Templates
3. Modifier le template de confirmation
4. Sauvegarder
```

---

### Étape 4: Tester l'authentification (15 minutes)
```
1. Ouvrir http://localhost:5173/signup
2. Remplir le formulaire
3. Vérifier que l'email de confirmation arrive
4. Confirmer l'email
5. Aller sur /login
6. Se connecter
7. Vérifier l'accès à /favoris
8. Ajouter/Retirer un produit des favoris
9. Recharger la page - les favoris doivent persister
```

✅ Vérification:
- [ ] Inscription fonctionne
- [ ] Email de confirmation reçu
- [ ] Connexion fonctionne
- [ ] Accès à la page des favoris
- [ ] Favoris persisten après reload
- [ ] Modification du mot de passe fonctionne

---

### Étape 5: Intégrer les favoris dans les pages produit
```
1. Ouvrir les pages de produits
2. Ajouter le hook useFavorites
3. Ajouter le bouton "❤️ Ajouter aux favoris"
4. Exemple en fin de ce document
```

---

### Étape 6: Mettre à jour le Header/Navbar
```
1. Ajouter les liens de navigation
2. Afficher le nom de l'utilisateur si connecté
3. Montrer "Se connecter" si déconnecté
4. Exemple en fin de ce document
```

---

## 💻 SNIPPETS À UTILISER

### Snippet 1: ProductCard avec favoris
```jsx
import { useFavorites } from '../context/FavoritesContext';
import { useUserAuth } from '../context/UserAuthContext';
import { Heart } from 'lucide-react';

export function ProductCard({ product }) {
  const { isAuthenticated } = useUserAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }
    await toggleFavorite(product);
  };

  const isFav = isFavorite(product.id);

  return (
    <div className="product-card">
      {/* ... */}
      <button
        onClick={handleFavoriteClick}
        className={`favorite-btn ${isFav ? 'text-red-500' : 'text-gray-400'}`}
      >
        <Heart size={24} fill={isFav ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
```

### Snippet 2: Header avec authentification
```jsx
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { LogOut, Heart, Lock, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useUserAuth();

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Logo</Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700">
                👤 {user?.email?.split('@')[0]}
              </span>
              
              <Link to="/favoris" className="flex items-center gap-2 text-red-500 hover:text-red-600">
                <Heart size={20} />
                Favoris
              </Link>

              <Link to="/change-password" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <Lock size={20} />
                Mot de passe
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <LogOut size={20} />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Se connecter
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

### Snippet 3: Afficher un message si non connecté
```jsx
import { useUserAuth } from '../context/UserAuthContext';
import { Link } from 'react-router-dom';

export function Favorites() {
  const { isAuthenticated } = useUserAuth();
  const { favorites } = useFavorites();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600 mb-4">Veuillez vous connecter pour voir vos favoris</p>
        <Link to="/login" className="text-blue-600 hover:underline">
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  // ... afficher les favoris
}
```

---

## 🔒 Permissions Supabase vérifiées

✅ RLS sur `user_profiles`:
- Chaque utilisateur voit son profil
- Chaque utilisateur peut éditer son profil

✅ RLS sur `favorites`:
- Chaque utilisateur voit ses favoris
- Chaque utilisateur peut ajouter ses favoris
- Chaque utilisateur peut supprimer ses favoris

---

## 📱 Endpoints API utilisés

**SignUp**: `POST /auth/v1/signup`
- Email, Password, Full Name

**Login**: `POST /auth/v1/signin`
- Email, Password

**Logout**: `POST /auth/v1/logout`
- Session Token

**Change Password**: `PUT /auth/v1/user`
- Password (nouveau)

**Get Favorites**: `GET /rest/v1/favorites?user_id=`
- Filtre par user_id

**Add Favorite**: `POST /rest/v1/favorites`
- user_id, product_id, product_name, product_price, etc.

**Delete Favorite**: `DELETE /rest/v1/favorites?user_id=&product_id=`
- user_id, product_id

---

## 🐛 Dépannage rapide

### "Email already registered"
❌ Email déjà utilisé
✅ Proposez un autre email ou "Mot de passe oublié"

### "Invalid login credentials"
❌ Email ou mot de passe incorrect
✅ Vérifiez les données saisies

### "Request failed (403)"
❌ RLS policy error
✅ Vérifiez les politiques SQL

### Favoris vides après login
❌ Pas de synchronisation
✅ Vérifiez useEffect dans FavoritesContext

---

## ✅ VALIDATION FINALE

Avant de passer à la production:

- [ ] Tous les tests passent
- [ ] Emails de confirmation reçus
- [ ] Favoris synchronisés correctement
- [ ] Sessions persistent
- [ ] Routes protégées fonctionnent
- [ ] RLS testé et validé
- [ ] UI responsive sur mobile
- [ ] Messages d'erreur clairs
- [ ] Aucune console error
- [ ] Passwor validation fonctionnelle

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Consultez USER_AUTH_SETUP.md
2. Vérifiez les logs Supabase
3. Testez manuellement dans SQL Editor
4. Vérifiez la console du navigateur

**Vous êtes prêt! 🚀**

