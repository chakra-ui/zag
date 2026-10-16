import type { HTMLAttributes } from "react"

// Short values stay on one line
function format(value: unknown) {
  if (typeof value === "string") return value
  const inline = JSON.stringify(value)
  return inline && inline.length <= 48 ? inline : JSON.stringify(value, null, 2)
}

/** Labeled readout of example state; non-string values render as JSON */
export function Output(props: { label: string; value: unknown } & HTMLAttributes<HTMLPreElement>) {
  const { label, value, ...rest } = props
  return (
    <div className="output">
      <span className="output-label">{label}</span>
      <pre {...rest}>{format(value)}</pre>
    </div>
  )
}
