import { useCatalog } from '../../context/CatalogContext.jsx';
import CategoryCard from '../layers/CategoriesList.jsx';
import Product from '../layers/Product.jsx';
import SlideShow from './Slideshow.jsx';
import { Sparkles, BookOpen } from 'lucide-react';
import { ProductSlider } from '../layers/ProductSlider.jsx';
import ContactPremium from '../pages/Contact.jsx';
import logo from '../../images/logo.png'


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

        {/* Welcome hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative rounded-2xl overflow-hidden p-6 md:p-10 bg-white shadow-2xl">
            <div className="absolute -left-28 -top-20 w-72 h-72 bg-gradient-to-br from-blue-100 to-amber-100 opacity-40 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0 flex items-center justify-center w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-white to-blue-50 rounded-lg border border-white/40 shadow-inner">
                {/* <BookOpen className="w-14 h-14 text-blue-600" /> */}
                <img src={logo} className="w-22 h-20 text-blue-600" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold shadow-sm">Tanger • Local</span>
                  <div className="flex items-center text-sm text-gray-500 gap-1"><Sparkles className="w-4 h-4" />Bienvenue</div>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">Bienvenue Chez <span className="text-blue-600">LIBRAIRIE TANGER SCOBE</span></h1>
                <p className="mt-2 text-gray-600 max-w-2xl mx-auto md:mx-0">Trouvez vos fournitures scolaires et articles de bureau au meilleur prix, pour tous les niveaux.
                  Qualité, choix et disponibilité immédiate <br/>  <br/></p>
                <p className="text-green-600 text-md font-bold">Tout pour réussir, au même endroit !</p>

                <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                  <button onClick={() => { const el = document.getElementById('categories'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-semibold shadow-lg transform hover:-translate-y-0.5 transition">Voir les catégories</button>
                  <a href="/contact" className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 hover:bg-gray-50">Contactez-nous</a>
                </div>
              </div>
            </div>
          </div>
        </section>
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