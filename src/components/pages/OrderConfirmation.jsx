import { NavLink } from 'react-router-dom';

export default function OrderConfirmation(){
  return (
    <section className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl font-bold mb-4">Merci pour votre commande !</h2>
      <p className="text-gray-600 mb-6">Nous avons bien reçu votre commande et vous enverrons une confirmation par e-mail.</p>
      <NavLink to="/" className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg">Retour à l'accueil</NavLink>
    </section>
  )
}
