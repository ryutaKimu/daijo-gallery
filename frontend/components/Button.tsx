'use client'
import Link from "next/link";

type ButtonProps = {
  href: string
  label: string
  className?: string
}


export const Button = ({href, label, className}:ButtonProps) => {
  return(
    <>
      <Link
        href={href}
        className={`
          inline-block px-16 py-4
          bg-[var(--color-main)] text-[var(--color-sub)]
          rounded-[var(--btn-radius)] text-center
          transition-colors duration-200
          hover:bg-[var(--color-main-hover)] hover:text-[var(--color-sub)]
          hover:shadow-md
          ${className || ""}
        `}
      >
        {label}
      </Link>
    </>
    )
  }