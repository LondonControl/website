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
      className="group relative flex flex-col overflow-hidden rounded-md border border-gray-200 bg-card text-card-foreground"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-gray-200 tablet:aspect-none group-hover:opacity-75 tablet:h-48">
          <img
            src={
              Object.keys(product.images || []).length === 0
                ? `https://hub.londoncontrol.com/storage/8b47084288dde67b494c9c826566039a/01HT84185CT9B8WNS9JSA180EF.png`
                : Object.values(product.images || [])[0]?.original_url
            }
            alt={product.title}
            className="size-full object-cover object-center tablet:size-full"
          />
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-base font-medium text-primary">{product.title}</h3>

        <p className="mt-2 text-lg font-semibold text-primary">
          £{product.price / 100}
        </p>

        {user && (
          <div className="mt-4">
            {cartContainsItem(product.id) ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => removeFromCart(product.id)}
              >
                Remove from basket
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => addToCart(product)}
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
