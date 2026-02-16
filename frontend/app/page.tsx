import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import FeaturedGallery from '@/components/works/FeaturedGallery'
import FeaturedGallerySkeleton from '@/components/works/FeaturedGallerySkeleton'
import heroImage from '@/public/main.jpg'

export const revalidate = 60

export default function Home() {
  return (
    <>
      {/* ヒーロー: -mt-14 でヘッダー(h-14)の裏に潜り込み、画面全体を使う */}
      <section className="relative -mt-14 h-dvh w-full overflow-hidden">
        <Image
          src={heroImage}
          alt="山田大乗 個展 メインヴィジュアル"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-wide text-white drop-shadow-md">
            山田 画集
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl tracking-widest text-white/80">
            人生の証跡
          </p>
          <Link
            href="/works"
            className="mt-8 px-8 py-3 text-sm bg-(--color-main) text-white rounded-(--btn-radius) hover:bg-(--color-main-hover) hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            作品を見る
          </Link>
        </div>
      </section>

      {/* 代表作品 */}
      <section className="py-12 sm:py-16">
        <h2 className="text-center text-3xl sm:text-4xl font-medium tracking-wide text-(--color-main)">
          代表作品
        </h2>
        <p className="mt-4 text-center text-1xl text-(--color-accent)">
          生き方が絵に映る。鮮明に、如実に、偽りなく。
        </p>
        <div className="mt-8">
          <Suspense fallback={<FeaturedGallerySkeleton />}>
            <FeaturedGallery />
          </Suspense>
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/works"
            className="text-sm tracking-wide text-(--color-main) hover:text-(--color-main-hover) transition-colors"
          >
            すべての作品を見る &rarr;
          </Link>
        </p>
      </section>
    </>
  )
}
