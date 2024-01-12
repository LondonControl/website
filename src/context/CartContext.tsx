import { createContext, useContext, useState } from 'react';

import type CartItem from '@/interfaces/CartItem';
import type Product from '@/interfaces/Product';

interface CartContextValue {
  cartItems: CartItem[];
  cartContainsItem: (productId: string) => boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  cartContainsItem: () => false,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
});

export const useCart = () => {
  return useContext(CartContext);
};

interface Props {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: Props) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartContainsItem = (productId: string) => {
    const existingCartItemIndex = cartItems.findIndex(
      (item) => item.product.id === productId
    );

    return existingCartItemIndex !== -1;
  };

  const addToCart = (product: Product) => {
    if (cartContainsItem(product.id)) {
      return;
    }

    setCartItems([...cartItems, { product }]);
  };

  const removeFromCart = (productId: string) => {
    const updatedCartItems = cartItems.filter(
      (item) => item.product.id !== productId
    );

    setCartItems(updatedCartItems);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price,
    0
  );

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartContainsItem,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
