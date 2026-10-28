import type { ReactNode } from "react"
import { chip, type ChipVariantProps } from "styled-system/recipes"

export function Chip(props: ChipVariantProps & { children: ReactNode }) {
  return <span className={chip({ tone: props.tone })}>{props.children}</span>
}
