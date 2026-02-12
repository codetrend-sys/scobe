import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    console.log('ScrollToTop triggered for:', location.pathname);
    
    // Scroll au changement de route
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {
      console.error('Error scrolling:', e);
    }
  }, [location]);

  return null;
}
