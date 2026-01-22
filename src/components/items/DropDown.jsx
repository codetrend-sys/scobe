import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import boutiqueData from "../data/data.js";
import { NavLink } from "react-router-dom";

export function CategoriesDropdown() {
  // visible: whether the dropdown DOM is mounted
  // open: whether the dropdown is visually shown (controls transition classes)
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  // configuration: delays (ms)
  const OPEN_DELAY = 120; // delay before starting open animation on hover
  const CLOSE_DELAY = 300; // delay before hiding after mouse leaves (increased for tolerance)
  const TRANSITION_DURATION = 300; // should match Tailwind duration class (ms)

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    // mount immediately so transition can run
    setVisible(true);
    // delay the visual open for a smoother feel
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    // start closing animation
    setOpen(false);
    // unmount after transition
    closeTimer.current = setTimeout(() => setVisible(false), Math.max(CLOSE_DELAY, TRANSITION_DURATION));
  };

  const handleButtonClick = () => {
    // toggle on click: if closed, open immediately; if open, close with animation
    if (!visible) {
      setVisible(true);
      // small timeout to ensure mounted -> then animate
      setTimeout(() => setOpen(true), 20);
    } else if (open) {
      setOpen(false);
      closeTimer.current = setTimeout(() => setVisible(false), TRANSITION_DURATION);
    } else {
      // visible but closed (rare) -> open
      setOpen(true);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleButtonClick}
        aria-expanded={open}
        className="flex items-center gap-1 text-gray-700 hover:text-blue-800 font-medium transition-colors"
      >
        Catégories
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Keep mounted when visible, toggle visual open state for transitions */}
      {visible && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={
            "absolute left-1/2 -translate-x-1/2 mt-[-1/2%]  w-[95%] sm:left-0 sm:translate-x-0 sm:w-[700px] bg-gray-200 shadow-xl rounded-2xl p-6 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 z-50 max-h-[70vh] overflow-auto " +
            "transform transition-all duration-300 ease-out " +
            (open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 pointer-events-none")
          }
          role="menu"
        >
          {boutiqueData.map((cat) => (
            <div key={cat.name}>
              <h4 className="font-semibold text-gray-900 mb-3">{cat.name}</h4>
              <ul className="space-y-2">
                {cat.subcategories.map((sub) => (
                  <NavLink 
                    to={`/souscategorie/${sub.id}`}
                    key={sub.id}
                    className="text-sm text-gray-500 hover:text-blue-800 cursor-pointer transition-colors block"
                  >
                    {sub.name}
                  </NavLink>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
