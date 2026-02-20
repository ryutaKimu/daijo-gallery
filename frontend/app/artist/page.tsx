import Image from 'next/image'

export default function Artist() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* ページヘッダー */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-medium text-(--color-main) tracking-wider">
          作者紹介
        </h1>
      </section>

      {/* プロフィール */}
      <section className="pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ポートレート */}
          <div className="relative aspect-4/5 overflow-hidden bg-(--color-sub)">
            <Image
              src="/main.jpg"
              alt="山田 大乗 肖像"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* テキスト */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-medium text-(--color-main)">
              山田 大乗
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-(--color-text)/80">
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

            {/* 経歴 */}
            <div className="pt-6 border-t border-(--color-main)/10">
              <h3 className="text-lg font-medium text-(--color-main) mb-4">
                主な経歴
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { year: '1972年', text: '東京藝術大学大学院修了' },
                  { year: '1985年', text: '初個展「記憶の残響」開催（銀座）' },
                  { year: '2005年', text: '文化庁芸術祭優秀賞受賞' },
                  { year: '2020年', text: '京都国立近代美術館にて大規模回顧展' },
                ].map(({ year, text }) => (
                  <li key={year} className="flex gap-3">
                    <span className="shrink-0 text-(--color-accent) tabular-nums">{year}</span>
                    <span className="text-(--color-text)/70">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 締めの言葉 */}
      <section className="py-10 sm:py-14 text-center border-t border-(--color-main)/10">
        <p className="text-base sm:text-lg text-(--color-text)/60 italic">
          「絵は、決して消えない真実の証言である。」
        </p>
      </section>
    </div>
  )
}
