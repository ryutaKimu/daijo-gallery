import { Work } from '@/types/work'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/components/works/Pagination'
import { supabase } from '@/lib/superbase'
import { buildImageUrl, getBlurDataUrl } from '@/lib/image-utils'
import { BLUR_DATA_URL } from '@/lib/constants'

interface WorkListProps {
  page?: number
  perPage?: number
  query?: string
  tagId?: number
}

type WorkRow = {
  id: number
  title: string
  year: string | null
  img_path: string
  works_tags: { tag_id: number }[]
}

// クエリにフィルター条件を適用するヘルパー関数
function applyFilters<T>(query: T, searchText?: string, tagIds?: number[] | null): T {
  let result = query
  if (searchText) {
    // @ts-expect-error - Supabaseクエリビルダーの型
    result = result.ilike('title', `%${searchText}%`)
  }
  if (tagIds !== null && tagIds !== undefined) {
    // @ts-expect-error - Supabaseクエリビルダーの型
    result = result.in('id', tagIds)
  }
  return result
}

async function fetchWorks(
  page: number,
  perPage: number,
  query?: string,
  tagId?: number,
): Promise<{ works: Work[]; totalPages: number }> {
  // ページネーションのバリデーション（上限を設けて過大なOFFSETを防止）
  const MAX_PAGE = 1000
  const validPage = Number.isInteger(page) && page > 0 && page <= MAX_PAGE ? page : 1

  // タグフィルター用の作品ID取得
  let tagFilterIds: number[] | null = null
  if (tagId) {
    const tagResult = await supabase
      .from('works_tags')
      .select('work_id')
      .eq('tag_id', tagId)

    if (tagResult.error) {
      console.error('Tag filter fetch error:', tagResult.error)
      return { works: [], totalPages: 0 }
    }
    tagFilterIds = tagResult.data?.map((r: { work_id: number }) => r.work_id) ?? []
  }

  const from = (validPage - 1) * perPage
  const to = from + perPage - 1

  // カウントクエリとデータクエリを構築
  let countQuery = supabase
    .from('works')
    .select('id', { count: 'exact', head: true })
    .eq('status', true)
  countQuery = applyFilters(countQuery, query, tagFilterIds)

  let dataQuery = supabase
    .from('works')
    .select('id, title, year, img_path, works_tags(tag_id)')
    .eq('status', true)
    .order('created_at', { ascending: false })
  dataQuery = applyFilters(dataQuery, query, tagFilterIds)
  dataQuery = dataQuery.range(from, to)

  // 並列実行
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])
  const { count } = countResult
  const { data: worksData, error } = dataResult

  if (error) {
    console.error('Works fetch error:', error)
    return { works: [], totalPages: 0 }
  }

  // 型安全な変換（Promise.all で並列ブラー生成）
  const works = await Promise.all(
    (worksData ?? []).map(async (work: WorkRow) => {
      const imageUrl = buildImageUrl(work.img_path)
      const blurDataURL = await getBlurDataUrl(imageUrl)

      return {
        id: work.id,
        title: work.title,
        year: work.year ?? '',
        imageUrl,
        blurDataURL,
        tags: work.works_tags.map((wt: { tag_id: number }) => wt.tag_id),
      }
    }),
  )

  const total = count ?? 0
  return { works, totalPages: Math.ceil(total / perPage) }
}

export default async function WorkList({
  page = 1,
  perPage = 6,
  query,
  tagId,
}: WorkListProps) {
  const { works, totalPages } = await fetchWorks(page, perPage, query, tagId)

  return (
    <>
      {works.length === 0 && (
        <p className="py-20 text-center text-sm text-(--color-main)/60">
          該当する作品が見つかりませんでした
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {works.map((work, index) => (
          <Link
            key={work.id}
            href={`/works/${work.id}`}
            className="group block"
          >
            <div className="relative aspect-4/5 overflow-hidden bg-(--color-sub)">
              <Image
                src={work.imageUrl}
                alt={work.title}
                fill
                className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 33vw"
                priority={index < 3}
                placeholder="blur"
                blurDataURL={work.blurDataURL || BLUR_DATA_URL}
              />
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-(--color-main) leading-snug line-clamp-2">
                {work.title}
              </p>
              {work.year && (
                <p className="mt-0.5 text-xs text-(--color-text)/40">{work.year}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </>
  )
}
