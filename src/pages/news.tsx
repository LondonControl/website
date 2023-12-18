/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import Moment from 'react-moment';
import { MoonLoader } from 'react-spinners';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import type NewsPost from '@/interfaces/NewsPost';
import MainLayout from '@/layouts/Main';
import { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getNewsPostsEndpoint } from '@/utils/Endpoints';

interface Props {}

const News: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getNewsPostsEndpoint('?paginate=none&sorts=-published_at&is_visible=1'),
    fetcher
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  return (
    <MainLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          News
        </h2>
      }
      meta={
        <Meta
          title={`News | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl">
          News
        </h1>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="relative mt-6 tablet:ml-[calc(2rem+1px)] tablet:pb-12 md:ml-[calc(3.5rem+1px)] laptop:ml-[max(calc(14.5rem+1px),calc(100%-80rem))] laptop:mt-12">
            <div className="absolute bottom-0 right-full top-3 mr-7 hidden w-px bg-slate-200 tablet:block md:mr-[3.25rem]"></div>
            <div className="space-y-16">
              {data.data.map((post: NewsPost) => (
                <article key={post.id} className="group relative">
                  <div className="absolute -inset-x-4 -inset-y-2.5 md:-inset-x-6 md:-inset-y-4"></div>
                  <svg
                    viewBox="0 0 9 9"
                    className="absolute right-full top-2 mr-6 hidden h-[calc(0.5rem+1px)] w-[calc(0.5rem+1px)] overflow-visible text-slate-200 tablet:block md:mr-12"
                  >
                    <circle
                      cx="4.5"
                      cy="4.5"
                      r="4.5"
                      stroke="currentColor"
                      className="fill-white"
                      stroke-width="2"
                    ></circle>
                  </svg>
                  <div className="relative">
                    <h3 className="pt-8 text-base font-semibold tracking-tight text-slate-900 laptop:pt-0">
                      {post.title}
                    </h3>
                    <div className="prose prose-slate prose-a:relative prose-a:z-10 mb-4 mt-2">
                      <p>{post.body}</p>
                    </div>
                    <dl className="absolute left-0 top-0 laptop:left-auto laptop:right-full laptop:mr-[calc(6.5rem+1px)]">
                      <dt className="sr-only">Date</dt>
                      <dd className="whitespace-nowrap text-sm leading-6">
                        <Moment
                          date={post.published_at}
                          format="DD MMMM YYYY"
                        />
                      </dd>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default News;
