import { createContext, useContext, useState } from 'react';

import type CartDiscount from '@/interfaces/CartDiscount';
import type CartItem from '@/interfaces/CartItem';
import type Discount from '@/interfaces/Discount';
import type Product from '@/interfaces/Product';

interface CartContextValue {
  isOpen: boolean;
  setIsOpen: any;
  cartItems: CartItem[];
  cartContainsItem: (productId: string) => boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartDiscount: CartDiscount | null;
  cartContainsDiscount: (discountId: string) => boolean;
  applyDiscount: (discount: Discount) => void;
  removeDiscount: (discountId: string) => void;
  cartDiscountTotal: number;
  cartSubtotal: number;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextValue>({
  isOpen: false,
  setIsOpen: () => false,
  cartItems: [],
  cartContainsItem: () => false,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartDiscount: null,
  cartContainsDiscount: () => false,
  applyDiscount: () => {},
  removeDiscount: () => {},
  cartDiscountTotal: 0,
  cartSubtotal: 0,
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<CartDiscount | null>(null);

  const cartContainsItem = (productId: string) => {
    const existingCartItemIndex = cartItems.findIndex(
      (item) => item.product.id === productId,
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
      (item) => item.product.id !== productId,
    );

    setCartItems(updatedCartItems);
  };

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.product.price,
    0,
  );

  const clearCart = () => {
    setCartItems([]);
  };

  const cartContainsDiscount = (discountId: string) => {
    return discountId === cartDiscount?.discount.id;
  };

  const applyDiscount = (discount: Discount) => {
    if (cartContainsDiscount(discount.id)) {
      return;
    }

    setCartDiscount({ discount });
  };

  const removeDiscount = (discountId: string) => {
    if (!cartContainsDiscount(discountId)) {
      return;
    }

    setCartDiscount(null);
  };

  // Get cart total, get the discount, - the amount or %.
  let cartDiscountTotal = 0;
  if (cartDiscount) {
    if (cartDiscount.discount.is_percentage) {
      cartDiscountTotal = (cartSubtotal * cartDiscount.discount.amount) / 10000;
    } else {
      cartDiscountTotal = cartSubtotal - cartDiscount.discount.amount;
    }
  }

  const cartTotal = cartSubtotal - cartDiscountTotal;

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        isOpen,
        setIsOpen,
        cartItems,
        cartContainsItem,
        addToCart,
        removeFromCart,
        clearCart,
        cartDiscount,
        cartContainsDiscount,
        applyDiscount,
        removeDiscount,
        cartDiscountTotal,
        cartSubtotal,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
