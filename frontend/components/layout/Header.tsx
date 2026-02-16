import Link from 'next/link'
import { NAV_LINKS } from '@/lib/constants'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-(--color-bg)/80 backdrop-blur-md border-b border-(--color-main)/5">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-14">
        <Link
          href="/"
          className="text-lg tracking-widest font-medium text-(--color-main) hover:opacity-70 transition-opacity"
        >
          山田 画集
        </Link>
        <ul className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm tracking-wide text-(--color-text)/70 hover:text-(--color-main) transition-colors duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
