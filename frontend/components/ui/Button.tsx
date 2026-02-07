import Link from 'next/link'

type ButtonProps = {
  href: string
  label: string
  className?: string
}

export const Button = ({ href, label, className }: ButtonProps) => {
  return (
    <Link
      href={href}
      className={`
          inline-block px-16 py-4
          bg-(--color-main) text-(--color-sub)
          rounded-(--btn-radius) text-center
          transition-colors duration-200
          hover:bg-(--color-main-hover) hover:text-(--color-sub)
          hover:shadow-md
          relative after:content-['>'] after:ml-2 
          ${className || ''}
        `}
    >
      {label}
    </Link>
  )
}
