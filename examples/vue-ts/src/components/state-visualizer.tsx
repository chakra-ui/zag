import { isBrowser } from "@chakra-ui/utilities/platform-utils"
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
          return isBrowser() && value instanceof HTMLElement
            ? value.tagName
            : value
        },
        4,
      )}
    </pre>
  )
}
