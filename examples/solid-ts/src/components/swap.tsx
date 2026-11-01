import type { JSX } from "solid-js"
import { Presence } from "./presence"

export const Swap = (props: { children: JSX.Element; open: boolean; fallback?: JSX.Element }) => {
  return (
    <>
      <Presence data-scope="swap" hidden={!props.open}>
        {props.children}
      </Presence>
      <Presence data-scope="swap" hidden={props.open}>
        {props.fallback}
      </Presence>
    </>
  )
}
