// app/works/page.tsx
import WorkList from '@/components/works/WorkList'

export default async function Works({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // searchParams を await で解決
  const params = await searchParams
  const page = Number(params.page) || 1

  return (
    <>
      <section className="relative h-[40vh] min-h-80 w-full overflow-hidden bg-(--color-bg) flex flex-col justify-center items-center px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium text-(--color-main) tracking-wider text-center leading-tight">
          作品 一覧
        </h1>
        <p className="text-xl sm:text-2xl text-center text-(--color-accent) mt-8 md:mt-12 max-w-3xl px-4">
          感情から始まらなかった芸術作品は芸術ではない。
        </p>
      </section>

      <section className="mt-8 md:mt-12 bg-(--color-bg) pb-16 md:pb-24">
        <WorkList featuredOnly={false} page={page} perPage={6} />
      </section>
    </>
  )
}
