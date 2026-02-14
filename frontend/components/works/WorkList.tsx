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

type WorkRow = {
  id: number
  title: string
  year: string | null
  image_path: string
  works_tags: { tag_id: number }[]
}

async function getWorks(): Promise<Work[]> {
  const { data, error } = (await supabase
    .from('works')
    .select('id, title, year, img_path, works_tags(tag_id)')
    .eq('status', true)
    .order('created_at', { ascending: false })) as { data: WorkRow[] | null; error: typeof Error | null }

  if (error) {
    console.error('Supabase fetch error:', error)
    return []
  }

  return (data ?? []).map((work) => ({
    id: work.id,
    title: work.title,
    year: work.year ?? '',
    imageUrl: supabase.storage.from('works').getPublicUrl(work.image_path).data.publicUrl,
    tags: work.works_tags.map((wt) => wt.tag_id),
  }))
}

export default async function WorkList({
  featuredOnly = false,
  page = 1,
  perPage = 5,
  query,
  tagId,
}: WorkListProps) {
  const allWorks = await getWorks()

  let filteredWorks: Work[]

  if (featuredOnly) {
    // トップページで表示する代表作は固定で3枚
    filteredWorks = allWorks.filter((work) => work.tags?.includes(1)).slice(0, 3)
  } else {
    filteredWorks = allWorks

    // テキスト検索フィルタ
    if (query) {
      filteredWorks = filteredWorks.filter((work) =>
        work.title.toLowerCase().includes(query.toLowerCase())
      )
    }

    // タグフィルタ
    if (tagId) {
      filteredWorks = filteredWorks.filter((work) => work.tags?.includes(tagId))
    }
  }

  const total = filteredWorks.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage
  const currentWorks = filteredWorks.slice(start, end)

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
          {currentWorks.map((work) => (
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
                  priority={work.id <= 5}
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

        {/* ページネーションをClient Componentに委譲 */}
        {!featuredOnly && totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  )
}
