// components/works/Pagination.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `/works?${params.toString()}`
  }

  return (
    <div className="mt-12 md:mt-16 flex justify-center items-center gap-4">
      <button
        disabled={currentPage <= 1}
        onClick={() => router.push(createPageURL(currentPage - 1))}
        className={`
          px-6 py-3 rounded-lg font-medium transition cursor-pointer
          ${
            currentPage <= 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-(--color-accent) text-white hover:bg-opacity-90'
          }
        `}
      >
        前へ
      </button>

      <span className="text-lg font-medium px-4">
        {currentPage} / {totalPages}
      </span>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createPageURL(currentPage + 1))}
        className={`
          px-6 py-3 rounded-lg font-medium transition cursor-pointer
          ${
            currentPage >= totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-(--color-accent) text-white hover:bg-opacity-90'
          }
        `}
      >
        次へ
      </button>
    </div>
  )
}
