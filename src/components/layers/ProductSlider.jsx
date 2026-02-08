// import { useState, useEffect, useRef } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import  ProductFeatured from "../layers/ProductFeatured.jsx";

// export function ProductSlider({ products }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const sliderRef = useRef(null);

//   const itemsPerView = 3;
//   const maxIndex = Math.max(0, products.length - itemsPerView);

//   // 🔄 Auto slide
//   useEffect(() => {
//     if (isPaused || products.length <= itemsPerView) return;

//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [isPaused, maxIndex, products.length]);

//   const goToPrevious = () => {
//     setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
//   };

//   const goToNext = () => {
//     setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
//   };

//   const goToSlide = (index) => {
//     setCurrentIndex(index);
//   };

//   return (
//     <div
//       className="relative w-full group"
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* Slider */}
//       <div className="overflow-hidden" ref={sliderRef}>
//         <div
//           className="flex transition-transform duration-700 ease-out gap-6"
//           style={{
//             transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
//           }}
//         >
//           {products.map((product) => (
//             <div
//               key={product.id}
//               className="flex-shrink-0"
//               style={{
//                 width: `calc(${100 / itemsPerView}% - ${
//                   ((itemsPerView - 1) * 24) / itemsPerView
//                 }px)`,
//               }}
//             >
//               <ProductFeatured product={product} />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation */}
//       {products.length > itemsPerView && (
//         <>
//           <button
//             onClick={goToPrevious}
//             className="absolute left-5 top-[36%] -translate-y-1/2 -translate-x-4 bg-blue-500 backdrop-blur-md text-white p-3 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
//           >
//             <ChevronLeft className="w-6 h-6 " />
//           </button>

//           <button
//             onClick={goToNext}
//             className="absolute right-0 top-[36%] -translate-y-1/2 translate-x-4 bg-blue-500 backdrop-blur-md text-white p-3 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
//           >
//             <ChevronRight className="w-6 h-6" />
//           </button>

//           {/* Dots */}
//           <div className="flex justify-center gap-2 mt-8">
//             {Array.from({ length: maxIndex + 1 }).map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => goToSlide(index)}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   index === currentIndex
//                     ? "bg-orange-500 w-8"
//                     : "bg-gray-300 w-2 hover:bg-gray-400"
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import ProductFeatured from "../layers/ProductFeatured.jsx";
import { useFavorites } from '../../context/FavoritesContext';

export function ProductSlider({ products }) {
  const { favorites, toggleFavorite, isFavorite } = useFavorites(); // <-- context favoris

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const sliderRef = useRef(null);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // 🔄 Auto slide
  useEffect(() => {
    if (isPaused || products.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, products.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative w-full group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider */}
      <div className="overflow-hidden" ref={sliderRef}>
        <div
          className="flex transition-transform duration-700 ease-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 relative"
              style={{
                width: `calc(${100 / itemsPerView}% - ${
                  ((itemsPerView - 1) * 24) / itemsPerView
                }px)`,
              }}
            >
              {/* Composant produit */}
              <ProductFeatured product={product} />

              {/* Icône favoris (original) */}
              <button
                onClick={async (e) => { 
                  e.stopPropagation(); 
                  const res = await toggleFavorite(product);
                  if (!res?.ok) {
                    setShowPopup(true);
                  }
                }}
                className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 transition-all duration-300"
              >
                <Heart
                  fill={isFavorite(product.id) ? 'currentColor' : 'none'}
                  className={`w-8 h-6 transition-transform duration-300 ${
                    isFavorite(product.id) ? 'text-red-500 scale-125' : 'text-gray-800'
                  }`}
                />
              </button>
              {showPopup && typeof document !== 'undefined' && createPortal(
                <>
                  <div className="fixed inset-0 bg-black/20 z-[60]" onClick={() => setShowPopup(false)} />
                  <div className="fixed inset-0 flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
                    <div className="w-80 bg-white rounded-xl shadow-2xl ring-1 ring-black/10">
                      <div className="flex items-start justify-between p-5">
                        <div className="flex-1 pr-3">
                          <h4 className="text-base font-bold text-gray-900">Connectez-vous pour continuer</h4>
                          <p className="text-sm text-gray-700 mt-2">Vous devez être connecté pour ajouter cet article à vos favoris.</p>
                          <div className="mt-4 flex gap-2">
                            <a href="/login" onClick={(e) => e.stopPropagation()} className="inline-block px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Se connecter</a>
                            <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setShowPopup(false); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>, document.body
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation flèches */}
      {products.length > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-5 top-[36%] -translate-y-1/2 -translate-x-4 bg-blue-500 backdrop-blur-md text-white p-3 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronLeft className="w-6 h-6 " />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-[36%] -translate-y-1/2 translate-x-4 bg-blue-500 backdrop-blur-md text-white p-3 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-blue-600 w-8"
                    : "bg-blue-200 hover:bg-green-500 w-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
