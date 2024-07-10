/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import Markdown from 'react-markdown';
import Moment from 'react-moment';

import Meta from '@/components/Meta';
import type NewsPost from '@/interfaces/NewsPost';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';
import { getNewsPostsEndpoint } from '@/utils/Endpoints';

interface Props {
  posts: NewsPost[];
}

const News: NextPage<Props> = ({ posts }) => {
  return (
    <MainLayout
      meta={
        <Meta
          title={`News | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-primary tablet:text-3xl">
          News
        </h1>

        {posts.length === 0 ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            {/* No posts returned */}
          </div>
        ) : (
          <div className="relative mt-6 tablet:ml-[calc(2rem+1px)] tablet:pb-12 md:ml-[calc(3.5rem+1px)] laptop:ml-[max(calc(14.5rem+1px),calc(100%-80rem))] laptop:mt-12">
            <div className="absolute bottom-0 right-full top-3 mr-7 hidden w-px bg-slate-200 tablet:block md:mr-[3.25rem]"></div>

            <div className="space-y-16">
              {posts.map((post: NewsPost) => (
                <article key={post.id} className="group relative">
                  <div className="absolute -inset-x-4 -inset-y-2.5 md:-inset-x-6 md:-inset-y-4"></div>

                  <svg
                    viewBox="0 0 9 9"
                    className="absolute right-full top-2 mr-6 hidden size-[calc(0.5rem+1px)] overflow-visible text-slate-200 tablet:block md:mr-12"
                  >
                    <circle
                      cx="4.5"
                      cy="4.5"
                      r="4.5"
                      stroke="currentColor"
                      className="fill-white"
                      strokeWidth="2"
                    ></circle>
                  </svg>

                  <div className="relative">
                    <h3 className="pt-8 text-base font-semibold tracking-tight text-primary laptop:pt-0">
                      {post.title}
                    </h3>

                    <div className="prose prose-slate prose-a:relative prose-a:z-10 mb-4 mt-2">
                      <Markdown>{post.body}</Markdown>
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

export async function getStaticProps() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL +
      getNewsPostsEndpoint('?paginate=none&sorts=-published_at&is_visible=1'),
  );
  const { data: posts } = await res.json();

  return {
    props: {
      posts,
    },
    revalidate: 10,
  };
}

export default News;
