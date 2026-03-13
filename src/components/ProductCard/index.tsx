import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import type Product from '@/interfaces/Product';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const { user } = useAuth({ middleware: 'guest' });
  const { setIsOpen, addToCart, removeFromCart, cartContainsItem } = useCart();
  const inCart = cartContainsItem(product.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-lg">
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative overflow-hidden"
      >
        <div className="aspect-[16/10] bg-muted">
          <img
            src={
              Object.keys(product.images || []).length === 0
                ? `https://placehold.co/640x400?text=LC`
                : Object.values(product.images || [])[0]?.original_url
            }
            alt={product.title}
            className="size-full object-cover object-center transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-60"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors duration-200 group-hover:bg-foreground/5">
          <span className="translate-y-2 text-xs font-medium uppercase tracking-widest text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            View product →
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="flex grow flex-col p-5">
        <div className="grow">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
            {product.title}
          </h3>
          <p className="mt-3 font-jetbrains text-2xl font-bold text-foreground">
            £{product.price / 100}
          </p>
        </div>

        {user && (
          <div className="mt-5">
            {inCart ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  removeFromCart(product.id);
                  setIsOpen(true);
                }}
              >
                Remove from basket
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  addToCart(product);
                  setIsOpen(true);
                }}
              >
                Add to basket
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
