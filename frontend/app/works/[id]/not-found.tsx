import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
      <h1 className="text-3xl font-display text-(--color-main) mb-4">
        作品が見つかりません
      </h1>
      <p className="text-sm text-(--color-text)/60 mb-8">
        お探しの作品は削除されたか、存在しません。
      </p>
      <Link
        href="/works"
        className="inline-block px-6 py-3 bg-(--color-main) text-white rounded-(--btn-radius) hover:bg-(--color-main-hover) transition-colors"
      >
        作品一覧に戻る
      </Link>
    </div>
  )
}
