"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { css } from "styled-system/css"

export function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.isActive(pathname) ? "page" : undefined}
          className={css({
            fontWeight: "medium",
            textStyle: "sm",
            _hover: { color: "fg" },
            _currentPage: {
              fontWeight: "semibold",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            },
          })}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}

interface NavLink {
  href: string
  label: string
  isActive: (pathname: string) => boolean
}

const navLinks: NavLink[] = [
  {
    href: "/overview/introduction",
    label: "Docs",
    isActive: (pathname) =>
      pathname.startsWith("/overview") ||
      pathname.startsWith("/components") ||
      pathname.startsWith("/guides") ||
      pathname.startsWith("/utilities"),
  },
  {
    href: "/showcase",
    label: "Showcase",
    isActive: (pathname) => pathname.startsWith("/showcase"),
  },
  {
    href: "/community",
    label: "Community",
    isActive: (pathname) => pathname.startsWith("/community"),
  },
]
