import { Button } from '@/components/ui/Button'

export default function Footer() {
  return (
    <footer className="bg-(--color-sub) text-(--color-text)">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="flex justify-center gap-8 mb-10">
          <Button href="/" label="トップへ" />
          <Button href="/works" label="作品一覧" />
          <Button href="/artist" label="作者紹介" />
        </div>
        <p className="text-lg font-semibold text-(--color-main)">山田 画集</p>
        <p className="mt-2 text-xs opacity-60">© 2026 Yamada Exhibition</p>
      </div>
    </footer>
  )
}
