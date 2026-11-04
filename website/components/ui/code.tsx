import { cx } from "styled-system/css"
import { inlineCode } from "./code.css"

export function Code(props: React.ComponentProps<"code">) {
  return <code {...props} className={cx(inlineCode, props.className)} />
}
