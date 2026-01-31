import { useParams } from "react-router-dom";
import Product from "./Product.jsx";
import { useState } from "react";
import { useCatalog } from '../../context/CatalogContext.jsx';

export default function SousCategorieCard() {
  const { id } = useParams(); // id de la catégorie
  const { categories, loading } = useCatalog();
  const category = categories.find(cat => String(cat.id) === String(id));

  const [selectedCat, setSelectedCat] = useState(null); // stocke la sous-catégorie sélectionnée

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (!category) return <p className="text-center py-20">Catégorie introuvable</p>;

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* --- TITRE --- */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Sous-catégories de {category.name}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explorez notre large gamme de produits organisés par sous-catégorie pour faciliter votre recherche
        </p>
      </div>

      {/* --- GRILLE DES SOUS-CATEGORIES --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-center">
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedCat(sub)} // stocke directement l'objet sous-catégorie
            className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={sub.imageUrl}
                alt={sub.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
              <div className="text-white">
                <h3 className="text-lg font-bold">{sub.name}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* --- PRODUITS DE LA SOUS-CATEGORIE SELECTIONNEE --- */}
      {selectedCat && (
        <div className="mt-16 ">
          <Product subCategory={selectedCat} />
        </div>
      )}
    </section>
  );
}
