import { X, Star, ShoppingCart, Truck, ShieldCheck, ChevronUp, Type } from 'lucide-react';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCatalog } from '../../context/CatalogContext.jsx';
import ProductDetail from "./ProductDetails";
import { useCart } from '../../context/CartContext';
import FavoriteButton from '../common/FavoriteButton.jsx';
import ScrollToTopButton from '../items/ScrollToTopButton.jsx';

export default function Product(props) {
  const { categories, loading } = useCatalog();
  const params = useParams();
  const id = props.subCategory?.id?.toString() || params.id;

  const subCategory = (categories || [])
    .flatMap(cat => cat.subcategories)
    .find(sub => sub.id.toString() === id);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { addToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [sortPrice, setSortPrice] = useState(null); // null, 'asc', 'desc'

  useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
  }, [currentPage]);

  const itemsPerPage = 10;

  if (loading) {
    return <p className="text-center py-20">Chargement...</p>;
  }

  if (!subCategory) {
    return <p className="text-center py-20">Sous-catégorie introuvable</p>;
  }

  // Tri des produits
  let sortedProducts = [...subCategory.products];
  if (sortAlpha) {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortPrice) {
    sortedProducts.sort((a, b) =>
      sortPrice === 'asc' ? a.price - b.price : b.price - a.price
    );
  }

  // Pagination
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirst, indexOfLast);
  

  const goToPrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const goToNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const goToPage = (page) => { setCurrentPage(page); };

  // Toggle tri prix
  const handlePriceSort = () => {
    if (sortPrice === 'asc') setSortPrice('desc');
    else setSortPrice('asc');
    setSortAlpha(false);
    setCurrentPage(1);
  };

  // Toggle tri alphabétique
  const handleAlphaSort = () => {
    setSortAlpha(!sortAlpha);
    setSortPrice(null);
    setCurrentPage(1);
  };

  // // Toggle favoris
  // const toggleFavorite = (productId) => {
  //   if (favorites.includes(productId)) {
  //     setFavorites(favorites.filter(id => id !== productId));
  //   } else {
  //     setFavorites([...favorites, productId]);
  //   }
  // };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tous nos Produits
          </h2>
          <p className="text-xl text-gray-600">
            Explorez notre catalogue complet
          </p>
        </div>

        {/* Section Tri */}
        <div className="flex flex-col md:flex-row md:items-center justify-between items-center gap-3 mb-6">
          <span className="font-semibold  text-gray-700  text-md lg:ml-[73%]">Trier par :</span>
          <div className="flex flex-wrap gap-2">
            {/* Tri Alphabétique */}
            <button
              onClick={handleAlphaSort}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition font-medium ${
                sortAlpha
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Type className="w-4 h-4" />
              Alphabetique
            </button>

            {/* Tri Prix */}
            <button
              onClick={handlePriceSort}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition font-medium ${
                sortPrice
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Prix
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-300 ${
                  sortPrice === 'asc' ? 'rotate-0' : sortPrice === 'desc' ? 'rotate-180' : 'opacity-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map(product => (
            <div
              key={product.id}
              onClick={() => { setSelectedProduct(product); setIsOpen(true); }}
              className="cursor-pointer transform transition hover:border-green-700 border border-transparent rounded-xl"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Icône favoris (composant partagé) */}
                <div className="absolute top-3 right-3">
                  <FavoriteButton product={product} />
                </div>

                <div className="p-4">
                  <span className="text-xs font-semibold text-orange-500 uppercase">
                    {product.category}
                  </span>

                  <h3 className="font-bold mt-1 mb-2">{product.name}</h3>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">{product.rating} (avis)</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold">{product.price.toFixed(2)} DH</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsOpen(true); }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="px-3 py-1 hover:underline decoration-2 decoration-green-600 underline-offset-4  rounded disabled:opacity-50"
          >
            Précédent
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-blue-200 text-gray-700 hover:bg-green-600'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 hover:underline decoration-2 decoration-green-600 underline-offset-4  rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </section>

      <ProductDetail
        product={selectedProduct}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAddToCart={(p) => { addToCart(p, 1); }}
      />
      <ScrollToTopButton />
    </>
  );
}
