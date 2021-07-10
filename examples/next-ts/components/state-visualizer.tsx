import { isBrowser } from "@ui-machines/utils/env"

export function StateVisualizer(props: {
  state: Record<string, any>
  style?: Record<string, any>
  reset?: boolean
}) {
  const { state, style, reset } = props
  return (
    <pre
      className="pre"
      style={
        reset
          ? style
          : {
              ...style,
              float: "right",
              position: "absolute",
              top: 40,
              right: 40,
              minWidth: 400,
              zIndex: -1,
            }
      }
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
