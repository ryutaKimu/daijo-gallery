// components/works/WorkList.tsx
import { Work } from '@/types/work'
import Image from 'next/image'
import Pagination from '@/components/works/Pagination'
import { supabase } from '@/lib/superbase'

interface WorkListProps {
  featuredOnly?: boolean
  page?: number
  perPage?: number
  query?: string
  tagId?: number
}

/** 代表作を示すタグID */
const FEATURED_TAG_ID = 1
/** トップページに表示する代表作の件数 */
const FEATURED_LIMIT = 3
/** 画像読み込み中のぼかしプレースホルダー (薄グレー 1x1 pixel) */
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJkQN/pOHJxAAAAABJRU5ErkJggg=='

type WorkRow = {
  id: number
  title: string
  year: string | null
  img_path: string
  works_tags: { tag_id: number }[]
}

async function getWorks({
  featuredOnly,
  page,
  perPage,
  query,
  tagId,
}: {
  featuredOnly: boolean
  page: number
  perPage: number
  query?: string
  tagId?: number
}): Promise<{ works: Work[]; totalPages: number }> {
  // タグフィルタ: featuredOnly時は代表作タグ、それ以外はtagIdでフィルタ
  let tagFilterIds: number[] | null = null
  const filterTagId = featuredOnly ? FEATURED_TAG_ID : tagId
  if (filterTagId) {
    const { data: tagRows } = (await supabase
      .from('works_tags')
      .select('work_id')
      .eq('tag_id', filterTagId)) as { data: { work_id: number }[] | null }
    tagFilterIds = tagRows?.map((r) => r.work_id) ?? []
  }

  // 件数取得とデータ取得を並列実行
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let countQuery = supabase
    .from('works')
    .select('id', { count: 'exact', head: true })
    .eq('status', true)
  if (query) countQuery = countQuery.ilike('title', `%${query}%`)
  if (tagFilterIds !== null) countQuery = countQuery.in('id', tagFilterIds)

  let dataQuery = supabase
    .from('works')
    .select('id, title, year, img_path, works_tags(tag_id)')
    .eq('status', true)
    .order('created_at', { ascending: false })
  if (query) dataQuery = dataQuery.ilike('title', `%${query}%`)
  if (tagFilterIds !== null) dataQuery = dataQuery.in('id', tagFilterIds)
  dataQuery = dataQuery.range(from, to)

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])
  const { count } = countResult
  const { data, error } = dataResult as unknown as { data: WorkRow[] | null; error: typeof Error | null }

  if (error) {
    console.error('Supabase fetch error:', error)
    return { works: [], totalPages: 0 }
  }

  const works = (data ?? []).map((work) => ({
    id: work.id,
    title: work.title,
    year: work.year ?? '',
    imageUrl: supabase.storage.from('gallery-images').getPublicUrl(work.img_path).data.publicUrl,
    tags: work.works_tags.map((wt) => wt.tag_id),
  }))

  const total = count ?? 0
  const totalPages = Math.ceil(total / perPage)
  return { works, totalPages }
}

export default async function WorkList({
  featuredOnly = false,
  page = 1,
  perPage = 5,
  query,
  tagId,
}: WorkListProps) {
  const limit = featuredOnly ? FEATURED_LIMIT : perPage
  const { works: currentWorks, totalPages } = await getWorks({
    featuredOnly,
    page: featuredOnly ? 1 : page,
    perPage: limit,
    query,
    tagId,
  })

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div
          className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          lg:grid-cols-3
          xl:grid-cols-3
          gap-5 sm:gap-10 lg:gap-20
        "
        >
          {currentWorks.map((work, index) => (
            <div
              key={work.id}
              className="
                group
                overflow-hidden
                rounded-xl
                shadow-lg
                bg-white
                transition-all duration-300
                hover:shadow-2xl
                hover:-translate-y-2
                cursor-pointer
              "
            >
              <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
                <Image
                  src={work.imageUrl}
                  alt={work.title}
                  fill
                  className="
                    object-cover
                    transition-transform duration-700 ease-out
                    group-hover:scale-110
                  "
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 3}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </div>

              <div className="p-6 text-center">
                <p className="text-2xl sm:text-2xl font-serif text-(--color-main) leading-tight mb-3">
                  {work.title}
                </p>
                <p className="text-base sm:text-lg text-(--color-text) opacity-90">{work.year}年</p>
              </div>
            </div>
          ))}
        </div>

        {/* ページネーション：スペースを常に確保してCLSを防止 */}
        {!featuredOnly && (
          <div className="min-h-20">
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
