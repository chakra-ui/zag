import type { ComponentChildren } from "preact"
import { Presence } from "./presence"

export const Swap = (props: { children: ComponentChildren; open: boolean; fallback?: ComponentChildren }) => {
  const { children, open, fallback } = props
  return (
    <>
      <Presence data-scope="swap" hidden={!open}>
        {children}
      </Presence>
      <Presence data-scope="swap" hidden={open}>
        {fallback}
      </Presence>
    </>
  )
}
