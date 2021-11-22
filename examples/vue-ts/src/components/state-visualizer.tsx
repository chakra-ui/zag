import { isDom } from "@ui-machines/utils"
import { h, SetupContext } from "vue"

export function StateVisualizer(props: { state: Record<string, any> }, { attrs }: SetupContext) {
  const { state } = props
  return (
    <pre
      class="pre"
      style={{
        float: "right",
        position: "absolute",
        overflow: "hidden",
        top: "40px",
        right: "40px",
        maxWidth: "240px",
        width: "100%",
        zIndex: -1,
      }}
      {...props}
      {...attrs}
    >
      {JSON.stringify(
        state,
        (key, value) => {
          if (key === "childNodes") return value.value.length
          return isDom() && value instanceof HTMLElement ? value.tagName : value
        },
        4,
      )}
    </pre>
  )
}
