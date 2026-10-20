"use client"

import { useEffect, useState } from "react"
import { Box, styled } from "styled-system/jsx"
import type { HTerm } from "./h-copy"

export const accent = { base: "#2f855a", _dark: "#48bb78" } as const
const tint = {
  base: "rgba(47, 133, 90, 0.08)",
  _dark: "rgba(72, 187, 120, 0.12)",
} as const

export function useActiveState(slugs: string[]) {
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

const INIT = 10
const ARROW = 40
const NODE = 28

function Arrow(props: { label?: string; lit?: boolean }) {
  return (
    <Box
      position="relative"
      h={`${ARROW}px`}
      display="flex"
      justifyContent="center"
      color={props.lit ? accent : "border.bold"}
      transition="color 200ms"
      aria-hidden="true"
    >
      <svg width="12" height={ARROW} viewBox={`0 0 12 ${ARROW}`} fill="none">
        <path
          d={`M6 1V${ARROW - 2}M2.5 ${ARROW - 5.5}L6 ${ARROW - 2}L9.5 ${ARROW - 5.5}`}
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      {props.label && (
        <styled.span
          position="absolute"
          left="calc(50% + 10px)"
          top="50%"
          transform="translateY(-50%)"
          fontFamily="mono"
          fontSize="9px"
          letterSpacing="0.1em"
          color="text.muted"
        >
          {props.label}
        </styled.span>
      )}
    </Box>
  )
}

export function StateRail(props: {
  items: { slug: string; state: string; title: string }[]
  active: string | null
}) {
  const index = props.items.findIndex((i) => i.slug === props.active)
  const y = index < 0 ? INIT / 2 : INIT + ARROW + index * (NODE + ARROW)
  return (
    <styled.nav
      aria-label="How Zag works"
      position="sticky"
      top="calc(56px + 40px)"
      w="full"
      px="5"
    >
      <Box position="relative">
        <Box
          h={`${INIT}px`}
          display="flex"
          justifyContent="center"
          aria-hidden="true"
        >
          <Box
            w={`${INIT}px`}
            h={`${INIT}px`}
            borderRadius="full"
            bg="text.muted"
          />
        </Box>
        <styled.ol display="flex" flexDirection="column">
          {props.items.map((item, i) => {
            const on = item.slug === props.active
            return (
              <li key={item.slug}>
                <Arrow label={i > 0 ? "NEXT" : undefined} lit={on} />
                <styled.a
                  href={`#${item.slug}`}
                  title={item.title}
                  aria-current={on ? "location" : undefined}
                  data-on={on ? "" : undefined}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  h={`${NODE}px`}
                  px="3"
                  borderWidth="1px"
                  borderColor="border.bold"
                  borderRadius="8px"
                  fontFamily="mono"
                  fontSize="11px"
                  color="text.muted"
                  bg="bg"
                  transition="color 160ms, border-color 200ms, background 200ms"
                  _hover={{ color: "text.bold", borderColor: "text.muted" }}
                  focusVisibleRing="outside"
                  css={{
                    "&[data-on]": {
                      color: "text.bold",
                      borderColor: accent,
                      bg: tint,
                    },
                  }}
                >
                  {item.state}
                </styled.a>
              </li>
            )
          })}
        </styled.ol>
        <Box
          position="absolute"
          left="50%"
          top="0"
          w="7px"
          h="7px"
          borderRadius="full"
          bg={accent}
          boxShadow="0 0 0 3px {colors.bg}"
          pointerEvents="none"
          aria-hidden="true"
          transition="transform 480ms cubic-bezier(0.65, 0, 0.35, 1)"
          _motionReduce={{ transition: "none" }}
          style={{ transform: `translate(-50%, ${y - 3.5}px)` }}
        />
      </Box>
    </styled.nav>
  )
}

export function ConnectPanel(props: {
  title: string
  id: string
  terms: HTerm[]
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.muted"
      overflow="hidden"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="3"
        px="4"
        h="10"
        borderBottomWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="12px"
      >
        <styled.span color="text.bold">
          {props.title} <styled.span color="text.muted">→</styled.span>
        </styled.span>
        <styled.span color="text.muted" fontSize="11px">
          {props.id}
        </styled.span>
      </Box>
      <Box px="4" py="4" fontSize="14px" lineHeight="1.6">
        <styled.span fontFamily="mono" color="text.muted" aria-hidden="true">
          {"{"}
        </styled.span>
        <styled.dl display="flex" flexDirection="column" gap="3" py="2" ps="4">
          {props.terms.map((t) => (
            <div key={t.term}>
              <styled.dt
                display="inline"
                fontFamily="mono"
                fontSize="13px"
                color="text.bold"
              >
                {t.key}
                <styled.span color="text.muted">: </styled.span>
              </styled.dt>
              <styled.dd display="inline" color="text.muted" textWrap="pretty">
                <styled.span fontFamily="mono" opacity="0.7">
                  &quot;
                </styled.span>
                {t.body}
                <styled.span fontFamily="mono" opacity="0.7">
                  &quot;
                </styled.span>
                <styled.span fontFamily="mono" opacity="0.7">
                  ,
                </styled.span>
              </styled.dd>
            </div>
          ))}
        </styled.dl>
        <styled.span fontFamily="mono" color="text.muted" aria-hidden="true">
          {"}"}
        </styled.span>
      </Box>
    </Box>
  )
}
