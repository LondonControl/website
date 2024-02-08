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
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        toast.error('Something went wrong');
      });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center border-gray-200 p-4 tablet:grid tablet:grid-cols-5 tablet:gap-x-6 tablet:p-6">
        <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm tablet:col-span-3 tablet:grid-cols-3 laptop:col-span-3">
          <div>
            <dt className="font-medium text-gray-900">Product</dt>
            <dd className="mt-1 text-gray-500">{product?.title}</dd>
          </div>

          <div className="hidden tablet:block">
            <dt className="font-medium text-gray-900">AIRAC</dt>
            <dd className="mt-1 text-gray-500">{product?.current_airac}</dd>
          </div>

          <div>
            <dt className="font-medium text-gray-900">Serial key</dt>
            <dd className="mt-1 font-medium text-gray-500">{serialKey?.key}</dd>
          </div>
        </dl>

        <div className="hidden laptop:col-span-2 laptop:flex laptop:items-center laptop:justify-end laptop:space-x-4">
          <Button
            variant="secondary"
            onClick={(event) => handleDownloadFile(event, product?.id || '')}
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadCard;
