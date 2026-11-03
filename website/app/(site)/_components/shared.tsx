import { styled } from "styled-system/jsx"

/** page gutter: 16 → 24 → 64 → 120 (1200 content at 1440) */
export const gutter = { base: "4", md: "6", lg: "16", xl: "120px" } as const

export function StateLabel(props: { index?: string; name: string }) {
  return (
    <styled.p fontFamily="mono" fontSize="12px" color="fg.subtle">
      {props.index && `${props.index} · `}state:{" "}
      <styled.span color="accent">&quot;{props.name}&quot;</styled.span>
    </styled.p>
  )
}
