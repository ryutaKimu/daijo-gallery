import Link from 'next/link'

export default function Header() {
  const linkClassName = `
    text-2xl
    relative
    pb-1
    transition-colors
    text-(--color-text)
    hover:text-[var(--color-main)]

    after:absolute
    after:left-0
    after:bottom-0
    after:h-[1px]
    after:w-0
    after:bg-[var(--color-main)]
    after:transition-all
    after:duration-300
    hover:after:w-full
  `
  return (
    <header>
      <nav className="mx-auto max-w-7xl flex items-center justify-end px-10 py-5">
        <ul className="flex items-center gap-10 font-medium text-(--color-text)">
          {/* 作品一覧 */}
          <li>
            <Link href="/works" className={linkClassName}>
              作品一覧
            </Link>
          </li>

          {/* 作者紹介 */}
          <li>
            <Link href="/introduce" className={linkClassName}>
              作者紹介
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
