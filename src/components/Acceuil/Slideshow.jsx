import { useState, useEffect, useRef } from "react";
import { useAlert } from '../common/AlertProvider.jsx';
import { NavLink } from "react-router-dom";

import {informatique,imprimante,print,scolaire } from '../../images/index.jsx';

const products = [
  { id: 14, name: "Imprimantes & Solutions d'impression", description: "Imprimantes, toners et accessoires pour bureaux et impressions professionnelles.", image: imprimante },
  { id: 14, name: "Ordinateurs & Accessoires", description: "Portables et PC de bureau, périphériques et composants pour usage personnel et professionnel.", image: informatique },
  { id: 10, name: "Fournitures Scolaires", description: "Cahiers de qualité pour vos idées créatives.", image: scolaire },
  { id: 1000, name: "Demande de devis - Impression & Objets", description: "Devis personnalisé pour impressions (bâches, roll-up, affiches, vinyles) et objets publicitaires (stylos, mugs, clés USB).", image: print },
];

export default function SlideShow({ isPaused: externalIsPaused }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const autoPlayRef = useRef(null);
  const totalSlides = products.length;
  // Modal Devis
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [quoteSubject, setQuoteSubject] = useState('Demande générale');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const alert = useAlert();

  // Grouped subjects for quote requests (rendered with <optgroup>)
  const quoteSubjectGroups = [
    {
      label: 'Grand format',
      options: [
        'Impression grand format',
        'Bâches publicitaires (PVC)',
        'Roll-up',
        'X-Banner',
        'Kakémonos',
        'Vinyle adhésif (vitrophanie, covering)',
        'Panneaux publicitaires',
        'Impression backlit (éclairage arrière)'
      ]
    },
    {
      label: 'Impression commerciale',
      options: [
        'Impression commerciale (petit & moyen format)',
        'Cartes de visite',
        'Flyers & brochures',
        'Catalogues',
        'Affiches',
        'Stickers & étiquettes'
      ]
    },
    {
      label: 'Objets publicitaires',
      options: [
        'Stylos',
        'Carnets',
        'Mugs',
        'Porte-clés',
        'Clés USB personnalisées'
      ]
    },
    {
      label: 'Autres',
      options: [
        'Design graphique',
        'Personnalisation (logo/texte)',
        'Tarif pour grande quantité',
        'Délai de livraison'
      ]
    }
  ];

  const adminEmail = 'scobelibrairietanger@gmail.com';
  const adminPhone = '212661655137';

  // Détecter changement de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestion de l'auto-play
  useEffect(() => {
    // Pauser complètement si on est en train de scroller sur mobile
    if (externalIsPaused) {
      return () => clearInterval(autoPlayRef.current);
    }

    // Sinon, déterminer la vitesse
    const delay = isHovered ? 6000 : 2000;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, delay);

    return () => clearInterval(autoPlayRef.current);
  }, [isHovered, externalIsPaused, totalSlides]);

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
    let offset = index - currentIndex;
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
      className="w-full max-w-6xl mx-auto py-0 px-4 relative "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-live="polite"
    >
      {/* Flèches de navigation */}
      <button
        onClick={prevSlide}
        className="absolute -left-2 md:-left-16 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-blue-500/80 backdrop-blur-md text-white shadow-lg hover:bg-red-500 hover:scale-110 transition-all duration-300"
        aria-label="Slide précédente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute -right-2 md:-right-16 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full bg-blue-500/80 backdrop-blur-md text-white shadow-lg hover:bg-red-500 hover:scale-110 transition-all duration-300"
        aria-label="Slide suivante"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Conteneur des slides - clipping sur mobile uniquement */}
      <div className="relative h-[500px] md:h-[550px] perspective-1000" style={{clipPath: isMobile ? 'inset(0)' : 'none', overflow: isMobile ? 'hidden' : 'visible'}}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="absolute inset-0 w-full sm:max-w-sm md:max-w-lg lg:max-w-xl mx-auto transition-all duration-700 ease-out cursor-grab active:cursor-grabbing"
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
                {product.id === 1000 ? (
                  <button
                    onClick={() => {
                      setModalProduct(product);
                      setShowQuoteModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm"
                  >
                    Demander un devis
                  </button>
                ) : (
                  <NavLink to={`/categorie/${product.id}`}>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm">
                      Découvrir
                    </button>
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

          {showQuoteModal && modalProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowQuoteModal(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 z-10 overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Demande de devis</h2>
                <p className="text-sm md:text-base text-gray-600 mt-1">Remplissez le formulaire ci-contre — nous reviendrons vers vous rapidement.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(`mailto:${adminEmail}?subject=Demande%20de%20devis%20-%20${encodeURIComponent(modalProduct.name)}`)}
                  className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 border"
                  aria-label="Envoyer email rapide"
                >✉️ Email</button>
                <button
                  onClick={() => window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent('Demande rapide pour '+modalProduct.name)}`, '_blank')}
                  className="text-sm px-3 py-2 bg-green-50 hover:bg-green-100 rounded-md text-green-700 border border-green-100"
                  aria-label="Contacter sur WhatsApp"
                >💬 WhatsApp</button>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  aria-label="Fermer la fenêtre"
                >
                  ✕
                </button>
              </div>
            </div>

            {successMessage ? (
              <div className="animate-pulse p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-bold text-emerald-800 mb-1">Demande envoyée !</h3>
                <p className="text-sm text-emerald-700">Merci — nous revenons vers vous sous peu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left - Aperçu produit */}
                <aside className="bg-gradient-to-b from-white to-gray-50 p-4 rounded-lg flex flex-col items-center text-center">
                  <div className="w-full aspect-square rounded-lg overflow-hidden shadow-inner mb-4">
                    <img src={modalProduct.image} alt={modalProduct.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">{modalProduct.name}</h4>
                  <p className="text-sm text-gray-600 mt-2 mb-4">{modalProduct.description}</p>
                  <ul className="text-sm text-gray-700 mb-4 space-y-2">
                    <li>• Qualité professionnelle</li>
                    <li>• Options de personnalisation</li>
                    <li>• Livraison rapide disponible</li>
                  </ul>
                  {/* <div className="mt-auto w-full">
                    <button onClick={() => window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent('Bonjour, je souhaite un devis pour '+modalProduct.name)}`, '_blank')} className="w-full mb-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Contacter via WhatsApp</button>
                    <button onClick={() => window.open(`mailto:${adminEmail}?subject=Devis%20${encodeURIComponent(modalProduct.name)}`)} className="w-full px-4 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50">Envoyer un email</button>
                  </div> */}
                </aside>

                {/* Right - Formulaire */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);

                    try {
                      const formData = new URLSearchParams();
                      formData.append('name', clientName);
                      formData.append('email', clientEmail);
                      formData.append('phone', clientPhone);
                      formData.append('subject', quoteSubject);
                      formData.append('product', modalProduct.name);
                      formData.append('message', message);
                      formData.append('_subject', `Nouvelle demande de devis : ${modalProduct.name}`);
                      formData.append('_template', 'table');
                      formData.append('_captcha', 'false');

                      const emailRes = await fetch(`https://formsubmit.co/${adminEmail}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          Accept: 'application/json',
                        },
                        body: formData.toString(),
                      });

                        if (!emailRes.ok) throw new Error('Erreur envoi email');

                      const whatsappMessage = `🛒 Nouvelle demande de devis - ${modalProduct.name}\n👤 ${clientName} • ${clientPhone} • ${clientEmail}\nSujet: ${quoteSubject}\n\n${message}`;
                      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

                      setSuccessMessage('✅ Votre demande a été envoyée.');
                      setTimeout(() => {
                        setShowQuoteModal(false);
                        setSuccessMessage('');
                        setClientName('');
                        setClientEmail('');
                        setClientPhone('');
                        setMessage('');
                        setQuoteSubject('Demande générale');
                      }, 2500);
                    } catch (err) {
                      console.error('Erreur:', err);
                      alert.showError('Erreur lors de l\'envoi. Veuillez réessayer.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                    <select value={quoteSubject} onChange={(e) => setQuoteSubject(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200" required>
                      <option value="Demande générale">Demande générale</option>
                      {quoteSubjectGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">👤</span>
                      <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Votre nom" className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200" required />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                      <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Votre email" className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200" required />
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">📞</span>
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+212 6xx xxx xxx" className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Détails et quantités souhaitées..." className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-200 resize-none" />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => { setShowQuoteModal(false); }} className="px-4 py-2 bg-gray-100 rounded-lg">Annuler</button>
                    <button type="submit" disabled={loading} className="ml-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow hover:scale-[1.02] transition-transform">
                      {loading ? '⏳ Envoi...' : '✉️ Envoyer la demande'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

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
