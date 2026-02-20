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
  const params = await searchParams
  const page = Number(params.page) || 1
  const rawQuery = typeof params.q === 'string' ? params.q.slice(0, 200) : ''
  const query = rawQuery || undefined
  const tagId = Number(params.tag) || undefined

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ページヘッダー */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-medium text-(--color-main) tracking-wider">
          作品一覧
        </h1>
        <p className="mt-2 text-sm text-(--color-accent)">
          感情から始まらなかった芸術作品は芸術ではない。
        </p>
      </section>

      {/* 検索・フィルター */}
      <section className="pb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TextSearch />
        <TagSearch tags={DUMMY_TAGS} />
      </section>

      {/* 作品グリッド */}
      <section className="pb-12 sm:pb-16">
        <Suspense fallback={<WorkListSkeleton count={6} />}>
          <WorkList page={page} perPage={6} query={query} tagId={tagId} />
        </Suspense>
      </section>
    </div>
  )
}
