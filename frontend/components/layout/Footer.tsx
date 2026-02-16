import Link from 'next/link'
import { NAV_LINKS } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="border-t border-(--color-main)/10 bg-(--color-sub)">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <p className="text-base font-medium tracking-widest text-(--color-main)">
              山田 画集
            </p>
            <p className="mt-2 text-xs leading-relaxed text-(--color-text)/40">
              70歳画家 山田大乗による芸術作品集
            </p>
          </div>
          <nav>
            <ul className="flex gap-6">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-(--color-text)/50 hover:text-(--color-main) transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs text-(--color-text)/30">
          &copy; 2026 Yamada Exhibition
        </p>
      </div>
    </footer>
  )
}
