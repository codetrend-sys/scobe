import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import { b, p, o,informatique,imprimante,print,scolaire } from '../../images/index.jsx';

const products = [
  { id: 1, name: "Papeterie Deluxe", description: "Tout pour vos besoins en papeterie.", image: imprimante },
  { id: 2, name: "Stylo Premium", description: "Stylos élégants pour tous vos écrits.", image: informatique },
  { id: 3, name: "Fournitures Scolaires", description: "Cahiers de qualité pour vos idées créatives.", image: scolaire },
  { id: 4, name: "Cahier Artistique", description: "Cahiers de qualité pour vos idées créatives.", image: print },
];

export default function SlideShow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);
  const totalSlides = products.length;

  // Gestion de l'auto-play
  useEffect(() => {
    if (!isHovered) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 2000);
    } else {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 6000);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isHovered, totalSlides]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Pour un effet de défilement fluide sur desktop
  const getTransformForSlide = (index) => {
    const offset = index - currentIndex;
    if (Math.abs(offset) > 1 && totalSlides > 2) {
      // Gestion de la boucle infinie en CSS-like
      if (offset > 1) offset -= totalSlides;
      if (offset < -1) offset += totalSlides;
    }

    const translateX = offset * 100;
    const scale = offset === 0 ? 1 : 0.85;
    const opacity = offset === 0 ? 1 : 0.5;
    const zIndex = offset === 0 ? 3 : 2 - Math.abs(offset);
    const rotateY = offset * 8; // légère rotation 3D

    return { transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`, opacity, zIndex };
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto py-16 px-4 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-live="polite"
    >
      {/* Flèches de navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-blue-500 backdrop-blur-md text-white shadow-lg hover:bg-red-500 transition-all duration-300"
        aria-label="Slide précédente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-blue-500 backdrop-blur-md text-white shadow-lg hover:bg-red-500 transition-all duration-300"
        aria-label="Slide suivante"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Conteneur des slides */}
      <div className="relative h-[500px] md:h-[550px] overflow-visible perspective-1000">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="absolute inset-0 w-full max-w-md mx-auto transition-all duration-700 ease-out cursor-grab active:cursor-grabbing"
            style={{
              ...getTransformForSlide(index),
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full  h-full object-fit "
              />
              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              {/* Contenu texte */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow">{product.name}</h3>
                <p className="text-sm md:text-base mb-4 opacity-90">{product.description}</p>
                <NavLink to={`/categorie/${product.id}`}>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm">
                  Découvrir
                </button>
                </NavLink>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicateurs en bas */}
      <div className="flex justify-center space-x-3 mt-8">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "bg-blue-600 w-6 scale-125"
                : "bg-blue-200 hover:bg-green-500"
            }`}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}