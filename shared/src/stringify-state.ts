import formatHighlight from "json-format-highlight"

const pick = (obj: Record<string, any>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]))

export function stringifyState(state: Record<string, any>, omit?: string[]) {
  const code = JSON.stringify(
    state,
    (key, v) => {
      try {
        if (v.hasOwnProperty("target") && v.hasOwnProperty("timeStamp"))
          return pick(v, ["type", "target", "currentTarget", "relatedTarget"])

        if (omit?.includes(key)) {
          return undefined
        }

        if (v.hasOwnProperty("calendar")) {
          return v.toString()
        }

        if (Number.isNaN(v)) {
          return "NaN"
        }

        if (v instanceof File) {
          return v.name
        }

        switch (v?.toString()) {
          case "[object Machine]":
            const id = v.state.context.id ?? v.id
            return `Machine: ${id}`
          case "[object ShadowRoot]":
            return "#shadow-root"
          case "[object HTMLDocument]":
            return "#document"
          case "[object Window]":
            return "#window"
          case "[object AbortController]":
            return "#abort-cntroller"
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
