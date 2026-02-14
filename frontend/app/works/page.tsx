// app/works/page.tsx
import { Suspense } from 'react'
import WorkList from '@/components/works/WorkList'
import WorkListSkeleton from '@/components/works/WorkListSkeleton'
import { DUMMY_TAGS } from '@/data/tags'
import TextSearch from '@/components/ui/TextSearch'
import TagSearch from '@/components/ui/TagSearch'

export default async function Works({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // searchParams を await で解決
  const params = await searchParams
  const page = Number(params.page) || 1
  const query = typeof params.q === 'string' ? params.q : undefined
  const tagId = Number(params.tag) || undefined

  return (
    <>
      <section className="relative h-[40vh] min-h-80 w-full overflow-hidden bg-(--color-bg) flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium text-(--color-main) tracking-wider text-center leading-tight">
          作品 一覧
        </h1>
        <p className="text-xl sm:text-2xl text-center text-(--color-accent) mt-8 md:mt-12 max-w-3xl px-4">
          感情から始まらなかった芸術作品は芸術ではない。
        </p>
      </section>

      <section className="bg-(--color-bg) pt-8 md:pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TextSearch />
          <TagSearch tags={DUMMY_TAGS} />
        </div>
      </section>

      <section className="bg-(--color-bg) pb-16 md:pb-24">
        <Suspense fallback={<WorkListSkeleton count={6} />}>
          <WorkList featuredOnly={false} page={page} perPage={6} query={query} tagId={tagId} />
        </Suspense>
      </section>
    </>
  )
}
