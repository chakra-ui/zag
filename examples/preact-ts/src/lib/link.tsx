import type { ComponentProps } from "preact"

// Stand-in for `next/link`: preact-iso routes plain anchors on the client
export default function Link(props: ComponentProps<"a">) {
  return <a {...props} />
}
