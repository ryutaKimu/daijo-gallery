import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/superbase'
import { WorkDetail, RelatedWork } from '@/types/work'
import { buildImageUrl, getBlurDataUrl } from '@/lib/image-utils'
import { BLUR_DATA_URL } from '@/lib/constants'
import { SupabaseResponse, SupabaseArrayResponse } from '@/lib/supabase-types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

type WorkDetailRow = {
  id: number
  title: string
  description: string | null
  year: string | null
  img_path: string
  works_tags: {
    tags: {
      id: number
      tag_name: string
    }
  }[]
}

async function fetchWorkDetail(workId: string): Promise<WorkDetail | null> {
  const { data: workData, error } = (await supabase
    .from('works')
    .select(
      `
      id,
      title,
      description,
      year,
      img_path,
      works_tags(
        tags(
          id,
          tag_name
        )
      )
    `,
    )
    .eq('id', workId)
    .eq('status', true)
    .single())

  if (error || !workData) {
    console.error('Work fetch error:', error)
    return null
  }

  // 画像URLの構築とブラー生成
  const imageUrl = buildImageUrl(workData.img_path)
  const blurDataURL = await getBlurDataUrl(imageUrl)

  // タグの変換
  const tags = workData.works_tags.map((wt) => ({
    id: wt.tags.id,
    name: wt.tags.tag_name,
  }))

  return {
    id: workData.id,
    title: workData.title,
    description: workData.description,
    year: workData.year ?? '',
    imageUrl,
    blurDataURL,
    tags,
  }
}

function getCachedWorkDetail(workId: string) {
  const getWorkDetail = unstable_cache(
    () => fetchWorkDetail(workId),
    ['work-detail', workId],
    {
      revalidate: 60,
      tags: ['works', `work-${workId}`],
    },
  )
  return getWorkDetail()
}

async function fetchRelatedWorks(
  workId: number,
  tagIds: number[],
): Promise<RelatedWork[]> {
  if (tagIds.length === 0) return []

  // 同じタグを持つ作品IDを取得（上限20件でメモリ削減）
  type WorkTagRow = {
    work_id: number
  }

  const { data: relatedIds, error: relatedIdsError } = (await supabase
    .from('works_tags')
    .select('work_id')
    .in('tag_id', tagIds)
    .neq('work_id', workId)
    .limit(20)) as SupabaseArrayResponse<WorkTagRow>

  if (relatedIdsError) {
    console.error('Related work IDs fetch error:', relatedIdsError)
    return []
  }

  if (!relatedIds || relatedIds.length === 0) return []

  // SQL の IN 句は重複値を自動無視するため JS 側の Set 除算は不要
  const ids = relatedIds.map((r) => r.work_id)

  // 型定義
  type RelatedWorkRow = {
    id: number
    title: string
    img_path: string
  }

  // 作品データを取得
  const { data: works, error } = (await supabase
    .from('works')
    .select('id, title, img_path')
    .eq('status', true)
    .in('id', ids)
    .limit(4)) as SupabaseArrayResponse<RelatedWorkRow>

  if (error || !works) return []

  // Promise.all で並列ブラー生成
  return Promise.all(
    works.map(async (work) => {
      const imageUrl = buildImageUrl(work.img_path)
      const blurDataURL = await getBlurDataUrl(imageUrl)

      return {
        id: work.id,
        title: work.title,
        imageUrl,
        blurDataURL,
      }
    }),
  )
}

function getCachedRelatedWorks(workId: number, tagIds: number[]) {
  const getRelatedWorks = unstable_cache(
    () => fetchRelatedWorks(workId, tagIds),
    ['related-works', workId.toString()],
    {
      revalidate: 60,
      tags: ['works'],
    },
  )
  return getRelatedWorks()
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id } = await params

  const work = await getCachedWorkDetail(id)

  if (!work) {
    notFound()
  }

  const relatedWorks = await getCachedRelatedWorks(
    work.id,
    work.tags.map((t) => t.id),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/works"
          className="text-sm text-(--color-accent) hover:text-(--color-main) transition-colors"
        >
          ← 作品一覧に戻る
        </Link>
      </nav>

      {/* Main Content: 2カラムグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Section */}
        <div className="relative aspect-4/5 overflow-hidden bg-(--color-sub) rounded-(--card-radius)">
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            placeholder="blur"
            blurDataURL={work.blurDataURL || BLUR_DATA_URL}
          />
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-(--color-main) leading-tight">
              {work.title}
            </h1>
            {work.year && (
              <p className="mt-2 text-sm text-(--color-accent)">
                制作年: {work.year}
              </p>
            )}
          </div>

          {work.description && (
            <div>
              <p className="text-base text-(--color-text) leading-relaxed whitespace-pre-wrap">
                {work.description}
              </p>
            </div>
          )}

          {work.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-(--color-text) mb-3">
                タグ
              </h2>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/works?tag=${tag.id}`}
                    className="inline-block px-3 py-1.5 text-xs bg-(--color-main) text-white rounded-full hover:bg-(--color-main-hover) transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Images Section (Dummy) */}
      <section className="mt-16 pt-12 border-t border-(--color-main)/10">
        <h2 className="text-2xl font-display text-(--color-main) mb-6">
          制作過程
        </h2>
        <p className="text-sm text-(--color-text)/60">準備中です</p>
      </section>

      {/* Related Works Section */}
      {relatedWorks.length > 0 && (
        <section className="mt-16 pt-12 border-t border-(--color-main)/10">
          <h2 className="text-2xl font-display text-(--color-main) mb-6">
            関連作品
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedWorks.map((related) => (
              <Link
                key={related.id}
                href={`/works/${related.id}`}
                className="group block"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-(--color-sub) rounded-(--card-radius)">
                  <Image
                    src={related.imageUrl}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={related.blurDataURL || BLUR_DATA_URL}
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-(--color-main) leading-snug line-clamp-2">
                  {related.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const work = await getCachedWorkDetail(id)

  if (!work) {
    return {
      title: '作品が見つかりません',
    }
  }

  return {
    title: `${work.title} - 山田画集`,
    description: work.description ?? `${work.title}（${work.year}）の作品詳細ページ`,
  }
}
