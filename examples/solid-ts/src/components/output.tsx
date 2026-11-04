import { omit } from "solid-js"
import type { JSX } from "@solidjs/web"

// Short values stay on one line
function format(value: unknown) {
  if (typeof value === "string") return value
  const inline = JSON.stringify(value)
  return inline && inline.length <= 48 ? inline : JSON.stringify(value, null, 2)
}

/** Labeled readout of example state; non-string values render as JSON */
export function Output(props: { label: string; value: unknown } & JSX.HTMLAttributes<HTMLPreElement>) {
  const rest = omit(props, "label", "value")
  return (
    <div class="output">
      <span class="output-label">{props.label}</span>
      <pre {...rest}>{format(props.value)}</pre>
    </div>
  )
}
