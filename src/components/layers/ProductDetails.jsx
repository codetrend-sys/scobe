import { X, Star, ShoppingCart, Truck, ShieldCheck } from "lucide-react";

export default function ProductDetail({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) {
  if (!isOpen || !product) return null;

  return (
    <>
     
      <div
        className="fixed inset-0  bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-10 bg-white rounded-xl z-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 " />
          </button>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Image */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Infos */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold">{product.name}</h2>
                {product.reference && (
                  <p className="text-sm text-green-600 mt-2 ml-3 font-semibold">Référence : {product.reference}</p>
                )}

                <div className="flex items-center space-x-2 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-gray-600">
                    {product.rating} ({product.reviewCount} avis)
                  </span>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-500">
                {product.price.toFixed(2)} DH
              </div>

              <p className="text-gray-600">{product.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  Livraison rapide au Maroc
                </div>
                <div className="flex items-center gap-2 ">
                  <ShieldCheck className="w-5 h-5 text-blue-500 " />
                  Garantie qualité
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg font-semibold text-lg transition bg-blue-500 text-white hover:bg-green-700"
              >
                <ShoppingCart className="w-6 h-6" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
