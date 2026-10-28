import type { ReactNode } from "react"
import { styled } from "styled-system/jsx"

export function Chip(props: {
  tone?: "neutral" | "accent"
  children: ReactNode
}) {
  const accent = props.tone === "accent"
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      gap="1.5"
      px="2"
      py="0.5"
      rounded="full"
      borderWidth="1px"
      fontFamily="mono"
      fontSize="11px"
      lineHeight="1.6"
      whiteSpace="nowrap"
      bg={accent ? "accent.tint" : "transparent"}
      borderColor={accent ? "accent.line" : "border.strong"}
      color={accent ? "accent" : "fg.muted"}
    >
      {props.children}
    </styled.span>
  )
}
