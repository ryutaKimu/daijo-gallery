import Link from 'next/link'

type ButtonProps = {
  href: string
  label: string
  className?: string
}

export const Button = ({ href, label, className }: ButtonProps) => {
  const ButtonClass = `
    inline-flex items-center justify-center
    w-[90%] max-w-sm
    py-3 px-4
    sm:w-auto
    sm:px-8 sm:py-3
    md:px-10 md:py-4
    lg:px-12 lg:py-4
    text-sm sm:text-base md:text-lg
    bg-(--color-main)
    text-(--color-sub)
    rounded-(--btn-radius)
    text-center
    transition-all duration-200
    hover:bg-(--color-main-hover)
    hover:shadow-md
    hover:scale-[1.03]
    active:scale-[0.97]
    ${className ?? ''}
  `
  return (
    <Link href={href} className={ButtonClass}>
      {label}
    </Link>
  )
}
