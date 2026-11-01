import { splitProps, type JSX } from "solid-js"

// Short values stay on one line
function format(value: unknown) {
  if (typeof value === "string") return value
  const inline = JSON.stringify(value)
  return inline && inline.length <= 48 ? inline : JSON.stringify(value, null, 2)
}

/** Labeled readout of example state; non-string values render as JSON */
export function Output(props: { label: string; value: unknown } & JSX.HTMLAttributes<HTMLPreElement>) {
  const [local, rest] = splitProps(props, ["label", "value"])
  return (
    <div class="output">
      <span class="output-label">{local.label}</span>
      <pre {...rest}>{format(local.value)}</pre>
    </div>
  )
}
