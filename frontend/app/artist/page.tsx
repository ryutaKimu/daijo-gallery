import Image from "next/image";

// app/artist/page.tsx または components/Artist.tsx
export default function Artist() {
  return (
    <main className="min-h-screen bg-(--color-bg) text-(--color-text)">
      {/* ヘッダー的なタイトルエリア */}
      <section className="relative py-20 md:py-32 bg-linear-to-b from-(--color-bg) to-(--color-sub) overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-(--color-main) tracking-wider mb-6">
            山田　画集
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-(--color-accent) opacity-90 font-light">
            作者紹介
          </p>
        </div>
      </section>

      {/* メインコンテンツ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 左側：写真 / ポートレート（架空の画家画像） */}
            <div className="relative aspect-square md:aspect-4/5 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/800/1000?random=50" // ← 実際は本物のポートレート画像に差し替え
                alt="山田 大乗 肖像"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                priority
              />
              {/* オプション：薄いオーバーレイ */}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />
            </div>

            {/* 右側：テキストエリア */}
            <div className="space-y-8 md:space-y-10">
              <h2 className="text-4xl md:text-5xl font-serif text-(--color-main) leading-tight">
                山田　大乗
              </h2>

              <div className="space-y-6 text-lg md:text-xl leading-relaxed opacity-90">
                <p>
                  1945年生まれ。幼少期より絵画に親しみ、1970年代より抽象表現を追求。
                  人生の断片、記憶の残響、刹那の輝きをテーマに、静謐でありながら強い情感を湛えた作品を発表し続けている。
                </p>

                <p>
                  言葉では語り尽くせない「決して消えない真実の証言」を、キャンバスに刻むことを生涯の使命としている。
                  絵は生き方を如実に、鮮明に、映し絵のように表す——それが彼の信条である。
                </p>

                <p>
                  現在も京都の古いアトリエにて制作を続け、国内外で個展を開催。
                  2026年、銀座ギャラリーNにて回顧展「山田個展 — 人生の証人達 —」を開催予定。
                </p>
              </div>

              {/* 追加情報（年表風 or 箇条書き） */}
              <div className="mt-10 pt-8 border-t border-(--color-main)/30">
                <h3 className="text-2xl md:text-3xl font-serif text-(--color-main) mb-6">
                  主な経歴
                </h3>
                <ul className="space-y-4 text-base md:text-lg">
                  <li className="flex items-start gap-4">
                    <span className="font-medium text-(--color-accent) min-w-25">1972年</span>
                    <span>東京藝術大学大学院修了</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-medium text-(--color-accent) min-w-25">1985年</span>
                    <span>初個展「記憶の残響」開催（銀座）</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-medium text-(--color-accent) min-w-25">2005年</span>
                    <span>文化庁芸術祭優秀賞受賞</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="font-medium text-(--color-accent) min-w-25">2020年</span>
                    <span>京都国立近代美術館にて大規模回顧展</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* フッター的な締め */}
      <section className="py-30 text-center">
        <div className="container mx-auto px-4">
          <p className="text-xl md:text-2xl font-serif text-(--color-text) opacity-80">
            「絵は、決して消えない真実の証言である。」
          </p>
        </div>
      </section>
    </main>
  )
}