"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { css, cx } from "styled-system/css"
import { Box, styled } from "styled-system/jsx"
import type { DiagramKey } from "./guide-copy"

export const accent = { base: "#2f855a", _dark: "#48bb78" } as const

const tick = css({
  position: "absolute",
  w: "10px",
  h: "10px",
  borderColor: "border.bold",
  transition: "border-color 160ms",
  pointerEvents: "none",
})

export function CornerTicks(props: { className?: string }) {
  return (
    <>
      <span
        className={cx(tick, props.className)}
        style={{ top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 }}
      />
      <span
        className={cx(tick, props.className)}
        style={{ top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 }}
      />
      <span
        className={cx(tick, props.className)}
        style={{
          bottom: -1,
          left: -1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
        }}
      />
      <span
        className={cx(tick, props.className)}
        style={{
          bottom: -1,
          right: -1,
          borderBottomWidth: 1,
          borderRightWidth: 1,
        }}
      />
    </>
  )
}

const bracket = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  fontFamily: "mono",
  fontSize: "13px",
  color: "text.bold",
  whiteSpace: "nowrap",
  transition: "color 120ms",
  focusVisibleRing: "outside",
  "& [data-b]": { color: "text.muted", transition: "color 120ms" },
  _hover: { "& [data-b]": { color: accent } },
})

export function BracketLink(props: {
  href: string
  children: ReactNode
  muted?: boolean
}) {
  return (
    <Link
      href={props.href}
      className={cx(
        bracket,
        props.muted &&
          css({ color: "text.muted", _hover: { color: "text.bold" } }),
      )}
    >
      <span data-b="">[</span>
      {props.children}
      <span data-b="">]</span>
    </Link>
  )
}

const glyphs: Record<DiagramKey, ReactNode> = {
  principles: (
    <>
      <circle cx="12" cy="14" r="5" />
      <circle cx="44" cy="14" r="5" />
      <circle cx="28" cy="40" r="5" />
      <path d="M17 14h22M41 18l-10 18M15 18l10 18" />
      <circle cx="28" cy="40" r="1.6" data-a="" />
    </>
  ),
  machines: (
    <>
      <rect x="4" y="18" width="18" height="14" rx="2" />
      <rect x="34" y="18" width="18" height="14" rx="2" />
      <path d="M22 25h10M29 22l3 3-3 3" />
      <path d="M13 18v-8h30v8" strokeDasharray="2 3" />
    </>
  ),
  events: (
    <>
      <path d="M4 10c14 0 18 15 28 15M4 18c12 0 16 7 28 7M4 32c12 0 16-7 28-7M4 40c14 0 18-15 28-15" />
      <path d="M32 25h18" />
      <circle cx="32" cy="25" r="2.4" />
      <circle cx="51" cy="25" r="1.6" data-a="" />
    </>
  ),
  anatomy: (
    <>
      <path d="M28 6l20 9-20 9-20-9z" />
      <path d="M8 24l20 9 20-9" />
      <path d="M8 33l20 9 20-9" strokeDasharray="2 3" />
    </>
  ),
  adapters: (
    <>
      <rect x="22" y="4" width="12" height="10" rx="1.5" />
      <path d="M28 14v8M10 22h36M10 22v8M22 22v8M34 22v8M46 22v8" />
      <rect x="6" y="30" width="8" height="8" rx="1" />
      <rect x="18" y="30" width="8" height="8" rx="1" />
      <rect x="30" y="30" width="8" height="8" rx="1" />
      <rect x="42" y="30" width="8" height="8" rx="1" />
    </>
  ),
  a11y: (
    <>
      <rect x="6" y="10" width="10" height="9" rx="1.5" />
      <rect x="19" y="10" width="10" height="9" rx="1.5" />
      <rect x="32" y="10" width="10" height="9" rx="1.5" />
      <rect x="6" y="22" width="10" height="9" rx="1.5" />
      <rect x="19" y="22" width="10" height="9" rx="1.5" data-a="" />
      <rect x="32" y="22" width="10" height="9" rx="1.5" />
      <rect x="6" y="34" width="36" height="7" rx="1.5" />
      <path d="M48 26h4" />
    </>
  ),
  styling: (
    <>
      <rect x="6" y="8" width="44" height="34" rx="3" strokeDasharray="2 3" />
      <rect x="14" y="16" width="28" height="6" rx="1.5" />
      <path d="M14 28h20M14 34h12" />
    </>
  ),
}

const glyphCss = css({
  w: "56px",
  h: "48px",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1",
  color: "text.muted",
  transition: "color 160ms",
  "& [data-a]": { fill: accent, stroke: accent, opacity: 0.85 },
})

export function Glyph(props: { name: DiagramKey }) {
  return (
    <svg viewBox="0 0 56 48" className={glyphCss} aria-hidden="true">
      {glyphs[props.name] ?? glyphs.principles}
    </svg>
  )
}

export function useActiveChapter(slugs: string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = slugs.join("|")
  useEffect(() => {
    const els = key
      .split("|")
      .map((s) => document.getElementById(s))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const seen = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        const current = els.find((el) => seen.get(el.id))
        setActive(current ? current.id : null)
      },
      { rootMargin: "-35% 0px -60% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key])
  return active
}

export function ChapterRail(props: {
  items: { id: string; slug: string; title: string }[]
  active: string | null
}) {
  return (
    <styled.nav
      aria-label="Chapters"
      position="sticky"
      top="calc(56px + 32px)"
      pt="2"
    >
      <styled.ol
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        fontFamily="mono"
        fontSize="11px"
      >
        {props.items.map((item, i) => {
          const on = props.active === item.slug
          return (
            <styled.li
              key={item.slug}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
            >
              {i > 0 && (
                <Box
                  color="border.bold"
                  lineHeight="1"
                  py="1.5"
                  aria-hidden="true"
                  display="flex"
                  flexDirection="column"
                  gap="1"
                >
                  <span>-</span>
                  <span>-</span>
                </Box>
              )}
              <styled.a
                href={`#${item.slug}`}
                title={item.title}
                aria-current={on ? "location" : undefined}
                display="flex"
                alignItems="center"
                gap="1.5"
                py="0.5"
                color={on ? "text.bold" : "text.muted"}
                _hover={{ color: "text.bold" }}
                transition="color 120ms"
                fontVariantNumeric="tabular-nums"
              >
                <styled.span
                  w="2"
                  color={accent}
                  opacity={on ? 1 : 0}
                  transition="opacity 160ms"
                >
                  &gt;
                </styled.span>
                {item.id}
              </styled.a>
            </styled.li>
          )
        })}
      </styled.ol>
    </styled.nav>
  )
}
