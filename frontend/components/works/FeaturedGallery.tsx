import { Work } from '@/types/work'
import { supabase } from '@/lib/superbase'
import { buildImageUrl, getBlurDataUrl } from '@/lib/image-utils'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'

const FEATURED_TAG_ID = 1
const FEATURED_LIMIT = 3

type WorkRow = {
  id: number
  title: string
  year: string | null
  img_path: string
  works_tags: { tag_id: number }[]
}

async function fetchFeaturedWorks(): Promise<Work[]> {
  // フィーチャータグが付いた作品IDを取得
  const tagResult = await supabase
    .from('works_tags')
    .select('work_id')
    .eq('tag_id', FEATURED_TAG_ID)

  if (tagResult.error) {
    console.error('Featured tags fetch error:', tagResult.error)
    return []
  }

  const workIds = tagResult.data?.map((r: { work_id: number }) => r.work_id) ?? []
  if (workIds.length === 0) return []

  // 作品データを取得
  const { data: worksData, error } = await supabase
    .from('works')
    .select('id, title, year, img_path, works_tags(tag_id)')
    .eq('status', true)
    .in('id', workIds)
    .order('created_at', { ascending: false })
    .limit(FEATURED_LIMIT)

  if (error) {
    console.error('Featured works fetch error:', error)
    return []
  }
  if (!worksData) return []

  // 型安全な変換（Promise.all で並列ブラー生成）
  return Promise.all(
    worksData.map(async (work: WorkRow) => {
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
}

const getFeaturedWorks = unstable_cache(fetchFeaturedWorks, ['featured-works'], {
  revalidate: 60,
  tags: ['works'],
})

export default async function FeaturedGallery() {
  const works = await getFeaturedWorks()
  if (works.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-(--color-main)/10">
      {works.map((work, index) => (
        <Link
          key={work.id}
          href={`/works/${work.id}`}
          className="group relative block overflow-hidden bg-(--color-sub)"
        >
          <div className="relative aspect-3/4">
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
              priority={index === 0}
              placeholder="blur"
              blurDataURL={work.blurDataURL}
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
              <h3 className="text-sm sm:text-base font-medium text-white leading-snug">
                {work.title}
              </h3>
              {work.year && (
                <p className="mt-0.5 text-xs text-white/60">{work.year}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
