import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import type Product from '@/interfaces/Product';
import type SerialKey from '@/interfaces/SerialKey';
import axios from '@/lib/axios';

interface Props {
  product?: Product;
  serialKey?: SerialKey;
}

const DownloadCard: React.FC<Props> = ({ product, serialKey }) => {
  const handleDownloadFile = async (event: any, productId: String) => {
    event.preventDefault();

    await axios
      .get(`/api/products/${productId}/download`)
      .then((res) => {
        window.open(res.data.data, '_blank');
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  return (
    <div className="rounded-md border border-gray-200 bg-card text-card-foreground">
      <div className="p-4 tablet:p-6">
        <dl className="grid grid-cols-3 items-center gap-x-6 text-sm laptop:grid-cols-6">
          <div className="col-span-2 laptop:col-span-2">
            <dt className="font-medium">Product</dt>
            <dd className="mt-1 text-muted-foreground hover:underline">
              <Link href={`/products/${product?.id}`}>{product?.title}</Link>
            </dd>
          </div>

          <div>
            <dt className="font-medium">AIRAC</dt>
            <dd className="mt-1 text-muted-foreground">
              {product?.current_airac}
            </dd>
          </div>

          <div className="col-span-full mt-4 laptop:col-span-2 laptop:mt-0">
            <dt className="font-medium">Serial key</dt>
            <dd className="mt-1 font-medium text-muted-foreground">
              {serialKey?.key ?? 'N/A'}
            </dd>
          </div>

          <div className="hidden justify-self-end laptop:flex">
            <Button
              variant="secondary"
              onClick={(event) => handleDownloadFile(event, product?.id || '')}
            >
              Download
            </Button>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default DownloadCard;
