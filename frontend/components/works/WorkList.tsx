import { Work } from '@/types/work'
import Image from 'next/image'
import Link from 'next/link'
import Pagination from '@/components/works/Pagination'
import { supabase } from '@/lib/superbase'

interface WorkListProps {
  page?: number
  perPage?: number
  query?: string
  tagId?: number
}

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+P9/PQAJkQN/pOHJxAAAAABJRU5ErkJggg=='

type WorkRow = {
  id: number
  title: string
  year: string | null
  img_path: string
  works_tags: { tag_id: number }[]
}

async function fetchWorks(
  page: number,
  perPage: number,
  query?: string,
  tagId?: number,
): Promise<{ works: Work[]; totalPages: number }> {
  let tagFilterIds: number[] | null = null
  if (tagId) {
    const { data: tagRows } = (await supabase
      .from('works_tags')
      .select('work_id')
      .eq('tag_id', tagId)) as { data: { work_id: number }[] | null }
    tagFilterIds = tagRows?.map((r) => r.work_id) ?? []
  }

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
  const { data, error } = dataResult as { data: WorkRow[] | null; error: Error | null }

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Supabase fetch error:', error)
    }
    return { works: [], totalPages: 0 }
  }

  const works = (data ?? []).map((work: WorkRow) => ({
    id: work.id,
    title: work.title,
    year: work.year ?? '',
    imageUrl: supabase.storage.from('gallery-images').getPublicUrl(work.img_path).data.publicUrl,
    tags: work.works_tags.map((wt) => wt.tag_id),
  }))

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
                blurDataURL={BLUR_DATA_URL}
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
