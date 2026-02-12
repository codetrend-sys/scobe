import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton({ minScroll = 300, forceOnPaths = ['/product', '/products', '/search', '/sous-categorie', '/souscategorie', '/subcategory'], forceOnSelectors = ['.product-list', '.subcategory-list', '#search-results'], forceAlwaysOnPaths = ['/product', '/products', '/search', '/sous-categorie', '/souscategorie', '/subcategory'], forceAlways = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(window);
  const location = useLocation();

  // find a scrollable element other than window (first visible element with scroll)
  const findScrollable = () => {
    try {
      const all = document.querySelectorAll('body *');
      for (const el of all) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.clientHeight === 0) continue;
        if (
          el.scrollHeight > el.clientHeight &&
          (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll')
        ) {
          return el;
        }
      }
    } catch (e) {
      // ignore
    }
    return window;
  };

  useEffect(() => {
    // re-detect on mount and whenever the location changes (including search params)
    let activeContainer = null;
    let ticking = false;
    const timeouts = [];
    const observerRef = { current: null };

    const attachTo = (container) => {
      activeContainer = container;
      scrollContainerRef.current = container;

      const getScrollTop = () => {
        if (container === window) return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return container.scrollTop || 0;
      };

      const check = () => {
        const top = getScrollTop();
        // determine whether we're on a forced path or selector exists
        let forced = false;
        try {
          const path = location && location.pathname ? location.pathname.toLowerCase() : '';
          forced = forceOnPaths.some(p => path.includes(p));
          if (!forced) {
            for (const sel of forceOnSelectors) {
              if (document.querySelector(sel)) { forced = true; break; }
            }
          }
        } catch (e) { }

        // also compute whether this path should ALWAYS show the button (no scroll needed)
        let forcedAlways = false;
        try {
          const path = location && location.pathname ? location.pathname.toLowerCase() : '';
          forcedAlways = forceAlwaysOnPaths.some(p => path.includes(p));
        } catch (e) { }

        // parent can explicitly force display
        if (forceAlways) forcedAlways = true;

        const threshold = forced ? Math.min(100, minScroll) : minScroll;
        console.log('Scroll position check (container):', top, 'visible>', top > threshold, 'threshold=', threshold, 'forced=', forced, 'forcedAlways=', forcedAlways, 'container=', container === window ? 'window' : container.tagName || container);
        setIsVisible(forcedAlways ? true : top > threshold);
      };

      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            check();
            ticking = false;
          });
          ticking = true;
        }
      };

      // attach listener
      if (container === window) window.addEventListener('scroll', onScroll, { passive: true });
      else container.addEventListener('scroll', onScroll, { passive: true });

      // initial check
      check();

      return () => {
        if (!container) return;
        if (container === window) window.removeEventListener('scroll', onScroll);
        else container.removeEventListener('scroll', onScroll);
      };
    };

    // initial attach
    let detach = attachTo(findScrollable());

    // also attempt re-detection after short delays (covers dynamic layouts)
    timeouts.push(setTimeout(() => { try { detach(); detach = attachTo(findScrollable()); } catch{} }, 100));
    timeouts.push(setTimeout(() => { try { detach(); detach = attachTo(findScrollable()); } catch{} }, 500));

    // and observe DOM changes to re-detect if a new scroll container appears
    try {
      const mo = new MutationObserver(() => {
        try {
          if (detach) detach();
          detach = attachTo(findScrollable());
        } catch (e) { }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      observerRef.current = mo;
    } catch (e) {
      // ignore
    }

    return () => {
      // cleanup
      try { if (detach) detach(); } catch (e) {}
      for (const t of timeouts) clearTimeout(t);
      try { if (observerRef.current) observerRef.current.disconnect(); } catch (e) {}
    };
  }, [location]);

  const scrollToTop = () => {
    try {
      const container = scrollContainerRef.current;
      console.log('Button clicked, scrolling container:', container === window ? 'window' : container);
      if (container === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 100);
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          container.scrollTop = 0;
        }, 150);
      }
    } catch (e) {
      console.error('ScrollToTop error', e);
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-7 bg-blue-300 hover:bg-blue-700 text-white rounded-full p-3 shadow-2xl transition-all duration-300 z-[60] pointer-events-auto cursor-pointer"
          aria-label="Scroller vers le haut"
          title="Scroller vers le haut"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
