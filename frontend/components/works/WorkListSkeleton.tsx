export default function WorkListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-3
          gap-5 sm:gap-10 lg:gap-20
        "
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="
                overflow-hidden
                rounded-xl
                shadow-lg
                bg-white
              "
            >
              <div className="relative aspect-4/5 overflow-hidden bg-gray-200 animate-pulse" />
              <div className="p-6 text-center space-y-3">
                <div className="h-7 bg-gray-200 rounded animate-pulse mx-auto w-3/4" />
                <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
