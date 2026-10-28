import Link from "next/link"
import type { ReactNode } from "react"
import { cva } from "styled-system/css"
import { styled } from "styled-system/jsx"

export const Frame = styled("div", {
  base: {
    maxW: "8xl",
    mx: "auto",
    borderXWidth: { base: "0", xl: "1px" },
    borderColor: "border",
  },
})

export const Band = styled("section", {
  base: {
    borderTopWidth: "1px",
    borderColor: "border",
    position: "relative",
  },
})

export const Pad = styled("div", {
  base: {
    px: { base: "4", sm: "6", md: "10" },
    py: { base: "12", md: "20" },
  },
})

export const Eyebrow = styled("p", {
  base: {
    fontFamily: "mono",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "text.muted",
  },
})

export const Title = styled("h2", {
  base: {
    fontSize: { base: "28px", md: "36px" },
    lineHeight: "1.1",
    letterSpacing: "-0.03em",
    fontWeight: "semibold",
    color: "text.bold",
    textWrap: "balance",
  },
})

export const Lead = styled("p", {
  base: {
    fontSize: { base: "16px", md: "18px" },
    lineHeight: "1.6",
    color: "text.muted",
    maxW: "52ch",
    textWrap: "pretty",
  },
})

const btn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
    h: "10",
    px: "4",
    fontSize: "14px",
    fontWeight: "medium",
    borderRadius: "md",
    transition: "background 120ms, border-color 120ms",
    focusVisibleRing: "outside",
  },
  variants: {
    tone: {
      solid: {
        bg: "text.bold",
        color: "bg",
        _hover: { opacity: 0.9 },
      },
      ghost: {
        borderWidth: "1px",
        borderColor: "border.bold",
        color: "text.bold",
        _hover: { bg: "bg.muted" },
      },
    },
  },
  defaultVariants: { tone: "solid" },
})

export function Btn(props: {
  href: string
  tone?: "solid" | "ghost"
  children: ReactNode
}) {
  return (
    <Link href={props.href} className={btn({ tone: props.tone })}>
      {props.children}
    </Link>
  )
}
