import { Presence } from "./presence"

export const Swap = (props: { children: React.ReactNode; open: boolean; fallback?: React.ReactNode }) => {
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
