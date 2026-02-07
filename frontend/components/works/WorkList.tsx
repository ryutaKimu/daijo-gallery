import Image from 'next/image'

/**
 * 仮データ（あとでAPIに置き換える）
 */
type Work = {
  id: number
  title: string
  year: string
  imageUrl: string
}

async function getDummyWorks(): Promise<Work[]> {
  return [
    {
      id: 1,
      title: '作品一',
      year: '1980',
      imageUrl: 'https://picsum.photos/600/800?random=1',
    },
    {
      id: 2,
      title: '作品二',
      year: '2010',
      imageUrl: 'https://picsum.photos/600/800?random=2',
    },
    {
      id: 3,
      title: '作品三',
      year: '1998',
      imageUrl: 'https://picsum.photos/600/800?random=3',
    },
  ]
}

export default async function WorksList() {
  // 将来ここを fetch に変える
  const works = await getDummyWorks()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {works.map((work) => (
        <div
          key={work.id}
          className="
            group
            overflow-hidden
            rounded-(--card-radius)
            shadow-(--card-shadow)
            bg-white
          "
        >
          {/* 画像 */}
          <div className="relative aspect-3/4 overflow-hidden">
            <Image
              src={work.imageUrl}
              alt={work.title}
              fill
              className="
                object-cover
                transition-transform duration-300
                group-hover:scale-105
              "
            />
          </div>

          {/* タイトル */}
          <div className="p-4 text-center">
            <p className="text-sm text-(--color-text)">{work.title}</p>
            <p className="text-sm text-(--color-text) mt-4">{work.year}年</p>
          </div>
        </div>
      ))}
    </div>
  )
}
