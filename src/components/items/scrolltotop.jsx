import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto', // tu peux mettre 'smooth' si tu veux avec animation
    });
  }, [pathname]);

  return null;
}
