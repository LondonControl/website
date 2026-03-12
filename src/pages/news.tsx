// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import Markdown from 'react-markdown';

import Meta from '@/components/Meta';
import PageHeader from '@/components/PageHeader';
import type NewsPost from '@/interfaces/NewsPost';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';
import { getNewsPostsEndpoint } from '@/utils/Endpoints';

interface Props {
  posts: NewsPost[];
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const News: NextPage<Props> = ({ posts }) => {
  return (
    <MainLayout
      meta={
        <Meta
          title={`News | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/news`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <PageHeader eyebrow="Updates" title="News" />

        {posts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Check back soon for updates.
            </p>
          </div>
        ) : (
          <motion.div
            className="relative mt-12"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {/* Vertical timeline line — sits in the centre of the 2rem left gutter */}
            <div className="absolute inset-y-0 left-[0.9375rem] w-px bg-border" />

            <div className="divide-y divide-border">
              {posts.map((post: NewsPost, index: number) => (
                <motion.article
                  key={post.id}
                  variants={rowVariants}
                  className="flex gap-8 py-8"
                >
                  {/* Timeline gutter — dot lives here, centred on the line */}
                  <div className="relative w-[1.875rem] shrink-0">
                    <div
                      className="absolute left-1/2 top-[0.4375rem] size-2 -translate-x-1/2 rounded-full bg-foreground"
                      style={{ boxShadow: '0 0 0 3px hsl(var(--background))' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="text-base font-black tracking-tight text-foreground">
                          {post.title}
                        </h3>
                        {index === 0 && (
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Latest
                          </span>
                        )}
                      </div>
                      <time
                        dateTime={dayjs(post.published_at).format('YYYY-MM-DD')}
                        className="font-jetbrains text-xs text-muted-foreground"
                      >
                        {dayjs(post.published_at).format('DD MMM YYYY')}
                      </time>
                    </div>

                    <div className="prose prose-sm prose-slate prose-a:relative prose-a:z-10 mt-3 max-w-none text-muted-foreground">
                      <Markdown skipHtml>{post.body}</Markdown>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export async function getStaticProps() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL +
      getNewsPostsEndpoint('?paginate=none&sorts=-published_at'),
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
