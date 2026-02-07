import { Button } from '@/components/ui/Button'
import WorksList from '@/components/works/WorkList'
import Image from 'next/image'

export default function Home() {
  const subTitleClass = `
    flex items-center justify-center
    text-xl md:text-2xl font-semibold tracking-wide
    text-[var(--color-text)]
    w-100
    mt-4
    before:content-['']
    before:h-10
    before:block
    before:flex-1 before:h-px
    before:bg-[var(--color-text)]/60
    before:mr-1 md:before:mr-4
    after:content-['']
    after:block
    after:flex-1 after:h-px
    after:bg-[var(--color-text)]/60
    after:ml-3 md:after:ml-4
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
          <h1 className="text-8xl font-medium text-(--color-main) tracking-wide">山田 個展</h1>

          <h2 className={subTitleClass}>人生の証人達</h2>
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
          <p className="text-(--color-text) font-bold text-2xl ">絵は人生の映し絵</p>

          <div className="mt-8">
            <WorksList />
          </div>
        </div>
      </section>
    </>
  )
}
