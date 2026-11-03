import { cx } from "styled-system/css"
import { kbd } from "./kbd.css"

export function Kbd(props: React.ComponentProps<"kbd">) {
  return <kbd {...props} className={cx(kbd, props.className)} />
}
