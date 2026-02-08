// components/works/WorkList.tsx
import { Work } from '@/types/work'
import Image from 'next/image'
import Pagination from '@/components/works/Pagination'

interface WorkListProps {
  featuredOnly?: boolean
  page?: number
  perPage?: number
}

async function getDummyWorks(): Promise<Work[]> {
  // 本番ではここを fetch に置き換え
  return [
    {
      id: 1,
      title: '封じられた記憶',
      year: '1980',
      imageUrl: 'https://picsum.photos/800/1000?random=1',
      tags: [1],
    },
    {
      id: 2,
      title: 'デジタル時代の孤独',
      year: '2010',
      imageUrl: 'https://picsum.photos/800/1000?random=2',
      tags: [1],
    },
    {
      id: 3,
      title: '刹那の輝き',
      year: '1998',
      imageUrl: 'https://picsum.photos/800/1000?random=3',
      tags: [1],
    },
    {
      id: 4,
      title: '人生の断片',
      year: '2005',
      imageUrl: 'https://picsum.photos/800/1000?random=4',
    },
    {
      id: 5,
      title: '静かな証言',
      year: '1992',
      imageUrl: 'https://picsum.photos/800/1000?random=5',
    },
    {
      id: 6,
      title: '忘却の彼方',
      year: '2015',
      imageUrl: 'https://picsum.photos/800/1000?random=6',
    },
    {
      id: 7,
      title: '響き合う影',
      year: '1985',
      imageUrl: 'https://picsum.photos/800/1000?random=7',
    },
    {
      id: 8,
      title: '永遠の一瞬',
      year: '2020',
      imageUrl: 'https://picsum.photos/800/1000?random=8',
    },
    {
      id: 9,
      title: '記憶の残響',
      year: '2000',
      imageUrl: 'https://picsum.photos/800/1000?random=9',
    },
    {
      id: 10,
      title: '人生の鏡',
      year: '1975',
      imageUrl: 'https://picsum.photos/800/1000?random=10',
    },
    {
      id: 11,
      title: '蒼穹の彼方へ',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=11',
    },
    {
      id: 12,
      title: '犬は共産党',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=12',
    },
    {
      id: 13,
      title: '猫は神の子',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=13',
    },
    {
      id: 14,
      title: '犬殺害現場',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=14',
    },
    {
      id: 15,
      title: '犬殺害現場2',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=15',
    },
    {
      id: 16,
      title: '犬殺害現場3',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=16',
    },
    {
      id: 17,
      title: '犬殺害現場4',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=17',
    },
    {
      id: 18,
      title: '犬殺害現場5',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=18',
    },
    {
      id: 19,
      title: '犬殺害現場6',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=19',
    },
    {
      id: 20,
      title: '犬殺害現場7',
      year: '2025',
      imageUrl: 'https://picsum.photos/800/1000?random=20',
    },
  ]
}

export default async function WorkList({
  featuredOnly = false,
  page = 1,
  perPage = 5,
}: WorkListProps) {
  const allWorks = await getDummyWorks()

  let filteredWorks = allWorks
  // トップページで表示する代表作は固定で3枚
  if (featuredOnly) {
    filteredWorks = allWorks.filter((work) => work.tags?.includes(1)).slice(0, 3)
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
