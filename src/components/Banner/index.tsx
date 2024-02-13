import Link from 'next/link';
import useSWR from 'swr';

import { fetcher } from '@/lib/axios';
import { getAnnouncementsEndpoint } from '@/utils/Endpoints';

interface Props {}

const Banner: React.FC<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getAnnouncementsEndpoint('?paginate=none&is_visible=1'),
    fetcher,
  );

  if (isLoading) return null;

  if (data.data.length === 0 && !isLoading) return null;

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <div className="flex items-center justify-center gap-x-6 bg-yellow-300 px-6 py-2.5 tablet:px-3.5">
      <p className="text-sm leading-6 text-gray-900">
        <Link href={data.data[0].url ?? '#'}>
          <strong className="font-semibold">{data.data[0].title}</strong>

          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline size-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>

          {data.data[0].text}

          {data.data[0].url && <span aria-hidden="true">&nbsp;&rarr;</span>}
        </Link>
      </p>
    </div>
  );
};

export default Banner;
