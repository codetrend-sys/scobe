export const botFlows = {
  start: {
    message: "👋 Bonjour ! Comment puis-je vous aider ?",
    options: [
      { label: "📦 Livraison", next: "livraison" },
      { label: "💳 Paiement", next: "paiement" },
      { label: "💰 Prix & promos", next: "prix" },
      { label: "📞 Contact", next: "contact" },
    ],
  },

  livraison: {
    message: "🚚 Informations sur la livraison :",
    options: [
      { label: "⏱ Délais", next: "delais" },
      { label: "💸 Frais", next: "frais" },
      { label: "⬅ Menu principal", next: "start" },
    ],
  },

  delais: {
    message: "⏱ Livraison entre 24h et 48h partout au Maroc.",
    options: [{ label: "⬅ Retour", next: "livraison" }],
  },

  frais: {
    message: "📦 La livraison est Gratuite.",
    options: [{ label: "⬅ Retour", next: "livraison" }],
  },

  paiement: {
    message: "💳 Paiement à la livraison disponible.",
    options: [{ label: "⬅ Menu principal", next: "start" }],
  },

  prix: {
    message: "💰 Les prix sont affichés sur chaque produit.",
    options: [{ label: "⬅ Menu principal", next: "start" }],
  },

  contact: {
    message: "📞 Appelez-nous au 06 61 65 51 37.\n📩 Écrivez-nous à tout moment scobelibrairietanger@gmail.com",
    options: [{ label: "⬅ Menu principal", next: "start" }],
  },
};
