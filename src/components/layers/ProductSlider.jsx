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
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import ProductFeatured from "../layers/ProductFeatured.jsx";
import { useFavorites } from '../../context/FavoritesContext';

export function ProductSlider({ products }) {
  const { favorites, toggleFavorite } = useFavorites(); // <-- context favoris

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
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

              {/* Icône favoris */}
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  toggleFavorite(product); 
                }}
                className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 transition-all duration-300"
              >
                <Heart
                  className={`w-8 h-6 text-gray-800 transition-transform duration-300 ${
                    favorites.some(p => p.id === product.id) ? 'fill-red-500 scale-125' : ''
                  }`}
                />
              </button>
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
