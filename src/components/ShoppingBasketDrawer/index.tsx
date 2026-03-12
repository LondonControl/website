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
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="space-x-2"
          onClick={() => setIsOpen(true)}
        >
          <ShoppingCart className="size-5" />
          {cartItems.length > 0 && (
            <span className="font-jetbrains text-xs font-bold">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader className="border-b border-border pb-4">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Your basket
          </span>
          <SheetTitle className="font-black tracking-tight">
            {cartItems.length === 0
              ? 'Empty'
              : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center">
            <ShoppingCart className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Your basket is empty
            </p>
            <SheetClose asChild>
              <Button variant="ghost" asChild size="sm" className="mt-2">
                <Link href="/products">Browse products →</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ul className="mt-4 divide-y divide-border">
              {cartItems.map((item: CartItem) => (
                <li key={item.product.id} className="flex gap-4 py-4">
                  <img
                    src={
                      Object.keys(item.product.images || []).length === 0
                        ? `https://placehold.co/96x96?text=LC`
                        : Object.values(item.product.images || [])[0]
                            ?.preview_url
                    }
                    alt={item.product.title}
                    className="size-20 shrink-0 rounded-lg border border-border bg-muted object-cover object-center"
                  />

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        London Control
                      </p>
                      <h3 className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                        {item.product.title}
                      </h3>
                      <p className="mt-1 font-jetbrains text-sm font-bold text-foreground">
                        £{item.product.price / 100}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="mt-1 w-fit cursor-pointer text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-jetbrains text-lg font-bold text-foreground">
                  £{cartSubtotal / 100}
                </span>
              </div>
            </div>

            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Go to checkout →</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingBasketDrawer;
