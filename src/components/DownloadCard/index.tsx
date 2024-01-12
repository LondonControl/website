import Moment from 'react-moment';

import { Button } from '@/components/ui/button';
import type Product from '@/interfaces/Product';

interface Props {
  product: Product;
}

const DownloadCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center border-gray-200 p-4 tablet:grid tablet:grid-cols-4 tablet:gap-x-6 tablet:p-6">
        <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm tablet:col-span-3 tablet:grid-cols-3 laptop:col-span-2">
          <div>
            <dt className="font-medium text-gray-900">Product</dt>
            <dd className="mt-1 text-gray-500">{product.title}</dd>
          </div>

          <div className="hidden tablet:block">
            <dt className="font-medium text-gray-900">File date</dt>
            <dd className="mt-1 text-gray-500">
              <Moment date={product.updated_at} format="D/MM/YYYY" />
            </dd>
          </div>

          <div>
            <dt className="font-medium text-gray-900">Serial key</dt>
            <dd className="mt-1 font-medium text-gray-500">{product.key}</dd>
          </div>
        </dl>

        <Button variant="secondary">Download</Button>
      </div>
    </div>
  );
};

export default DownloadCard;
