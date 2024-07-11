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
  const { addToCart, removeFromCart, cartContainsItem } = useCart();

  return (
    <div
      key={product.id}
      className="group relative flex flex-col overflow-hidden rounded-md border border-gray-200 bg-card"
    >
      <Link href={`/products/${product.id}`}>
        <div className="aspect-h-4 aspect-w-3 bg-gray-200 tablet:aspect-none group-hover:opacity-75 tablet:h-48">
          <img
            src={
              Object.keys(product.images || []).length === 0
                ? `https://placehold.co/300x300?text=LC`
                : Object.values(product.images || [])[0]?.original_url
            }
            alt={product.title}
            className="size-full object-cover object-center tablet:size-full"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-primary">{product.title}</h3>

        <div className="flex flex-1 flex-col justify-end">
          <p className="text-base font-semibold text-primary">
            £{product.price / 100}
          </p>
        </div>

        {user && (
          <>
            {cartContainsItem(product.id) ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => removeFromCart(product.id)}
              >
                Remove from basket
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => addToCart(product)}
              >
                Add to basket
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
