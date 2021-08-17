import { env } from "@core-foundation/utils/env"
import { h, SetupContext } from "vue"

export function StateVisualizer(props: { state: Record<string, any> }, { attrs }: SetupContext) {
  const { state } = props
  return (
    <pre
      className="pre"
      style={{
        float: "right",
        position: "absolute",
        top: "40px",
        right: "40px",
        minWidth: "400px",
        zIndex: -1,
      }}
      {...props}
      {...attrs}
    >
      {JSON.stringify(
        state,
        (key, value) => {
          if (key === "childNodes") return value.value.length
          return env.dom() && value instanceof HTMLElement ? value.tagName : value
        },
        4,
      )}
    </pre>
  )
}
