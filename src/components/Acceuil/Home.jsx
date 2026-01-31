import { useCatalog } from '../../context/CatalogContext.jsx';
import CategoryCard from '../layers/CategoriesList.jsx';
import Product from '../layers/Product.jsx';
import SlideShow from './Slideshow.jsx';
import { Sparkles } from 'lucide-react';
import { ProductSlider } from '../layers/ProductSlider.jsx';
import ContactPremium from '../pages/Contact.jsx';

export default function Home() {
  const { categories, loading } = useCatalog();
  
  const featuredProducts = (categories || [])
  .flatMap(category => category.subcategories)   // toutes les sous-catégories
  .flatMap(sub => sub.products)                  // tous les produits
  .filter(product => product.featured === true); // seulement les featured

  if (loading) return <div className="text-center py-16">Chargement...</div>;

    return (
        <>
        <SlideShow/>
         <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Nos Catégories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez notre large gamme de produits organisés par catégorie pour faciliter votre recherche
          </p>
        </div>
  <div className="flex flex-wrap justify-center gap-4">
          {(categories || []).map((category) => (
            <div key={category.id} className="w-1/2 md:w-1/3 lg:w-1/5 flex justify-center">
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Sélection du moment
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Produits en Vedette
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection des meilleurs produits, choisis spécialement pour vous
          </p>
        </div>

        <div className="group">
          <ProductSlider products={featuredProducts} />
        </div>
        <ContactPremium/>
      </section>
      </>
    );
}