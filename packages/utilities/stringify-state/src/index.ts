// @ts-ignore
import formatHighlight from "json-format-highlight"

interface Dict {
  [key: string]: any
}

const pick = (obj: Dict, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]))

const hasProp = (v: any, prop: string) => Object.prototype.hasOwnProperty.call(v, prop)

const isTimeObject = (v: any) => hasProp(v, "hour") && hasProp(v, "minute") && hasProp(v, "second")
const isMachine = (v: any) => ["state", "context", "scope"].every((prop) => hasProp(v, prop))

export function stringifyState(state: Dict, omit?: string[]) {
  const code = JSON.stringify(
    state,
    (key, value) => {
      try {
        if (hasProp(value, "target") && hasProp(value, "timeStamp"))
          return pick(value, ["type", "target", "currentTarget", "relatedTarget"])

        if (omit?.includes(key)) {
          return undefined
        }

        if (hasProp(value, "calendar") || isTimeObject(value)) {
          return value.toString()
        }

        if (typeof value?.json === "function") {
          return value.json()
        }

        if (typeof value?.toJSON === "function") {
          return value.toJSON()
        }

        if (Number.isNaN(value)) {
          return "NaN"
        }

        if (value instanceof File) {
          return value.name
        }

        if (value instanceof Set) {
          return Array.from(value)
        }

        if (isMachine(value)) {
          return `Machine: ${value.scope.id}`
        }

        switch (value?.toString()) {
          case "[object ShadowRoot]": {
            return "#shadow-root"
          }
          case "[object HTMLDocument]": {
            return "#document"
          }
          case "[object Window]": {
            return "#window"
          }
          case "[object AbortController]": {
            return "#abort-controller"
          }
          default: {
            return value !== null && typeof value === "object" && value.nodeType === 1 ? value.tagName : value
          }
        }
      } catch {
        return value
      }
    },
    4,
  )

  return code
}

export function highlightState(state: Dict, omit?: string[]) {
  return formatHighlight(stringifyState(state, omit))
}
