import React from 'react';
import Cart from './Cart';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartWrapper() {
  const { cartItems, open, setOpen, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // close the cart and navigate to checkout page
    setOpen(false);
    navigate('/cart');
  };

  return (
    <Cart
      isOpen={open}
      onClose={() => setOpen(false)}
      items={cartItems}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onCheckout={handleCheckout}
    />
  );
}
