import { styled } from "styled-system/jsx"

export function Eyebrow(props: { children: React.ReactNode }) {
  return (
    <styled.span
      fontFamily="mono"
      fontSize="xs"
      color="fg.subtle"
      textTransform="uppercase"
      letterSpacing="0.14em"
    >
      {props.children}
    </styled.span>
  )
}
