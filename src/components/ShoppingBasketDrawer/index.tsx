import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import type CartItem from '@/interfaces/CartItem';

interface Props {}

const ShoppingBasketDrawer: React.FC<Props> = () => {
  const { isOpen, setIsOpen, cartItems, cartSubtotal, removeFromCart } =
    useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button
          variant="ghost"
          className="space-x-2"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingCart className="size-5" />
          {cartItems.length > 0 && <span>{cartItems.length}</span>}
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Basket</SheetTitle>
        </SheetHeader>

        <ul className="mt-4">
          {cartItems.map((item: CartItem) => (
            <li key={item.product.id} className="flex space-x-6 py-2">
              <img
                src={
                  Object.keys(item.product.images || []).length === 0
                    ? `https://placehold.co/50x50?text=LC`
                    : Object.values(item.product.images || [])[0]?.preview_url
                }
                alt={item.product.title}
                className="size-24 flex-none rounded-md bg-gray-200 object-cover object-center"
              />

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1 text-sm font-medium">
                  <h3 className="text-primary">{item.product.title}</h3>

                  <p className="text-primary">£{item.product.price / 100}</p>
                </div>

                <Button
                  type="button"
                  variant="link"
                  className="-ml-4 justify-start"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-primary">
          <span className="text-base">Total</span>
          <span className="text-base">£{cartSubtotal / 100}</span>
        </p>

        <SheetFooter>
          <SheetClose asChild>
            <Button asChild className="mt-6 w-full">
              <Link href="/checkout">Go to checkout</Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingBasketDrawer;
