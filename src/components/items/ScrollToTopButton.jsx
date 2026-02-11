import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Affiche le bouton quand on scroll vers le bas
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll vers le haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-7 bg-blue-300 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 z-50"
          aria-label="Scroller vers le haut"
          title="Scroller vers le haut"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
