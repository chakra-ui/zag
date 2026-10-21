import { styled } from "styled-system/jsx"

export const accent = { base: "#2f855a", _dark: "#48bb78" } as const

export const gutter = { base: "4", sm: "6", md: "10" } as const

export function StateLabel(props: { name: string }) {
  return (
    <styled.p fontFamily="mono" fontSize="12px" color="text.muted">
      state: <styled.span color={accent}>&quot;{props.name}&quot;</styled.span>
    </styled.p>
  )
}
