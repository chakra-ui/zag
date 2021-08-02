import { env } from "@core-foundation/utils/env"
import { h } from "vue"

export function StateVisualizer(props: { state: Record<string, any> }) {
  const { state } = props
  return (
    <pre
      className="pre"
      style={{
        float: "right",
        position: "absolute",
        top: 40,
        right: 40,
        minWidth: 400,
      }}
    >
      {JSON.stringify(
        state,
        (_, value) => {
          return env.dom() && value instanceof HTMLElement
            ? value.tagName
            : value
        },
        4,
      )}
    </pre>
  )
}
