import formatHighlight from "json-format-highlight"

export function stringifyState(state: Record<string, any>) {
  const code = JSON.stringify(
    state,
    (_k, v) => {
      try {
        switch (v?.toString()) {
          case "[object Machine]":
            const id = v.state.context.id ?? v.id
            return `Machine: ${id}`
          case "[object ShadowRoot]":
            return "#shadow-root"
          case "[object HTMLDocument]":
            return "#document"
          default:
            return v !== null && typeof v === "object" && v.nodeType === 1 ? v.tagName : v
        }
      } catch {
        return v
      }
    },
    4,
  )
  return formatHighlight(code)
}
