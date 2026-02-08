import { Button } from '@/components/ui/Button'
import WorksList from '@/components/works/WorkList'
import Image from 'next/image'

export default function Home() {
  const subTitleClass = `
    flex items-center justify-center
    text-lg sm:text-xl md:text-2xl
    font-semibold tracking-wide
    text-[var(--color-text)]
    w-full max-w-2xl mx-auto
    mt-4

    before:content-['']
    before:block
    before:h-px
    before:bg-[var(--color-text)]/60

    before:w-8
    sm:before:w-16
    md:before:w-24
    lg:before:w-32

    before:mr-2 md:before:mr-4

    after:content-['']
    after:block
    after:h-px
    after:bg-[var(--color-text)]/60

    after:w-8
    sm:after:w-16
    md:after:w-24
    lg:after:w-32

    after:ml-2 md:after:ml-4
  `

  return (
    <>
      <section className="relative h-[70vh] w-full overflow-hidden">
        {/* 背景画像 */}
        <Image
          src="/main.png"
          alt="山田大乗 個展 メインヴィジュアル"
          fill
          className="object-cover"
          priority
        />

        {/* 画像に薄いフィルター */}
        <div className="absolute inset-0 bg-white/40" />

        {/* タイトルエリア */}
        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-(--color-main) tracking-wide">
            山田 画集
          </h1>

          <h2 className={subTitleClass}>人生の証跡</h2>
          <Button href="/works" label="作品を見る" className="mt-8" />
        </div>
      </section>

      <section className="py-24 bg-(--color-bg)">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1
            className="
            flex items-center justify-center
            text-4xl font-semibold tracking-wide
            text-(--color-main)
            mb-12
            before:content-['']
            before:flex-1 before:h-0.5
            before:bg-(--color-main)/50
            before:mr-6
            after:content-['']
            after:flex-1 after:h-0.5
            after:bg-(--color-main)/50
            after:ml-6
            "
          >
            代表作品
          </h1>
          <p className="text-(--color-text) font-bold text-2xl ">生き方が絵に映る。鮮明に、如実に、偽りなく。</p>

          <div className="mt-8">
            <WorksList featuredOnly={true} />
          </div>
        </div>
      </section>
    </>
  )
}
