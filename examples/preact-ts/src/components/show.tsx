import { ComponentChildren } from "preact"

export const Show = (props: { when: boolean; children: ComponentChildren }) => {
  const { when, children } = props
  return when ? <>{children}</> : null
}
