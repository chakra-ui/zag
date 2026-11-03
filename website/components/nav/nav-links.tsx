"use client"

import { componentsHref } from "lib/pagination-utils"
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
            position: "relative",
            display: "flex",
            alignItems: "center",
            h: "full",
            fontSize: "14px",
            color: "ink.muted",
            transition: "color 120ms",
            _hover: { color: "ink" },
            outline: "none",
            "&:focus-visible > span": {
              outline: "2px solid",
              outlineColor: "border.primary.bold",
              outlineOffset: "4px",
              rounded: "xs",
            },
            _currentPage: { color: "ink" },
          })}
        >
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  )
}

export interface NavLink {
  href: string
  label: string
  isActive: (pathname: string) => boolean
}

export const navLinks: NavLink[] = [
  {
    href: "/overview/introduction",
    label: "Docs",
    isActive: (pathname) =>
      pathname.startsWith("/overview") ||
      pathname.startsWith("/guides") ||
      pathname.startsWith("/utilities"),
  },
  {
    href: componentsHref,
    label: "Components",
    isActive: (pathname) => pathname.startsWith("/components"),
  },
  {
    href: "/showcase",
    label: "Showcase",
    isActive: (pathname) => pathname.startsWith("/showcase"),
  },
  {
    href: "/blog",
    label: "Blog",
    isActive: (pathname) => pathname.startsWith("/blog"),
  },
]
