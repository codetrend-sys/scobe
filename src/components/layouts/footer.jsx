import { ShoppingCart, Facebook, Instagram, Twitter, Mail,Phone} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';


import { Truck, Star, MessageCircle } from 'lucide-react';
import logo from '../../images/logo.png';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { NavLink } from 'react-router-dom';


export function Footer() {
  const { categories, loading } = useCatalog();
  return (
    <footer className="bg-gradient-to-r from-scobe-blue-dark to-scobe-blue-light text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

          {/* LOGO + SOCIAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className='w-48 h-42 mb-2' /> 
            </div>
            <p className="text-sm leading-relaxed">
              Votre destination pour les meilleurs produits tech et accessoires premium.
            </p>
             <div className="flex gap-3">
              <a href="https://www.facebook.com/librairiescobe/" target='_blank' className="p-2 text-green-600 rounded-lg hover:bg-blue-700 hover:text-white transition-colors">
                <Facebook className="w-8 h-8  " />
              </a>
              <a href="https://www.instagram.com/librairie_scobe?fbclid=IwY2xjawPMa7hleHRuA2FlbQIxMABicmlkETF0N3JQQ1VFTUNSQlZPYmpuc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHnwYM5bauV72bArnD7pZYqeewAgeFwyG3O5dQhtoYV-IdUkkWEnDEC_O-Smy_aem_L4YDi7kB02vZdmSb7BY5yg" target='_blank' className="p-2 text-green-600 rounded-lg hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400  hover:text-white transition-colors">
                <Instagram className="w-8 h-8 " />
              </a>
              <a href="https://wa.me/212661655137" target='_blank' className="p-2 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
                <FaWhatsapp className="w-8 h-8 " />
              </a>
              <a href="#" className="p-2 text-green-600 rounded-lg hover:bg-white hover:text-red-500  transition-colors">
                <Mail className="w-8 h-8 " />
              </a>
              <a href="tel:+212539386065" className="p-2 text-green-600 rounded-lg hover:bg-blue-700 hover:text-white  transition-colors">
                <Phone className="w-8 h-8 " />
              </a>
            </div>
            


           
          </div>

          {/* CATEGORIES */}
          <div>
            <h3 className="text-white font-bold mb-4 ">Catégories</h3>
            
             <div className="grid grid-cols-2 gap-6 text-sm">
                {loading ? <div>Chargement...</div> : (categories || []).map((cat) => (
                  <NavLink
                    to={`/categorie/${cat.id}`}
                    key={cat.id}
                    className="text-sm text-white/90 hover:text-orange-500 cursor-pointer transition-colors block"
                  >
                    {cat.name}
                  </NavLink>
                ))}
              </div>
          </div>

          {/* SUPPORT – À DROITE AVEC ESPACEMENT */}
          <div className="lg:flex lg:flex-col ">
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-white/90 leading-relaxed">
              <li className="flex items-start gap-2 group">
                <Truck className="w-5 h-5 text-orange-500 mt-1 transition-transform group-hover:scale-125 animate-bounce" />
                <span>
                  <span className="font-medium">Livraison rapide</span> dans toutes les villes,
                  avec un suivi fiable jusqu’à votre porte.
                </span>
              </li>
              <li className="flex items-start gap-2 group">
                <Star className="w-5 h-5 text-yellow-400 mt-1 transition-transform group-hover:scale-125 animate-pulse" />
                <span>
                  <span className="font-medium">Qualité garantie</span> sur tous nos produits,
                  soigneusement sélectionnés.
                </span>
              </li>
              <li className="flex items-start gap-2 group">
                <MessageCircle className="w-5 h-5 text-green-400 mt-1 transition-transform group-hover:scale-125 animate-bounce" />
                <span>
                  <span className="font-medium">Service client à l’écoute</span>, disponible pour vous accompagner avant et après l’achat.
                </span>
              </li>
            </ul>
            
          </div>

        </div>
        <div className="lg:flex lg:flex-col mt-12 ">
          <h3 className="text-white font-bold mb-4">Nos Adresses</h3>  
          <div className="flex flex-col md:flex-row gap-16">
              {/* Carte 1 */}
              <div className="md:w-1/2  w-full h-80 flex flex-col">
              
                <iframe
                  title="Agence 1"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51803.16964184956!2d-5.905134478320295!3d35.75822440000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b8778802e2b07%3A0xaec6c7c99829b40!2sLEBRARIE%20TANGER%20SCOBE%201!5e0!3m2!1sen!2sma!4v1767874838692!5m2!1sen!2sma"
                  className="w-full h-full border-0 rounded-xl"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="text-white font-medium mt-2">
                  LIBRAIRIE TANGER SCOBE 1 - Adresse principale
                </p>
              </div>
              
              {/* Carte 2 */}
              <div className="md:w-1/2 w-full h-80  flex flex-col">
                <iframe
                  title="Agence 2"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3238.4862147764!2d-5.8329587!3d35.7388524!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b870f2f4727cf%3A0x422923fb07deb871!2sLEBRARIE%20TANGER%20SCOBE%202!5e0!3m2!1sen!2sma!4v1767870473918!5m2!1sen!2sma"
                  className="w-full h-full border-0 rounded-xl"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="text-white font-medium mt-2">
                 LIBRAIRIE TANGER SCOBE 2 - Adresse secondaire
                </p>
              </div>
            </div>
          </div>
        {/* COPYRIGHT */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>&copy; 2026 Scope. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
