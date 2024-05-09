import * as checkbox from "@zag-js/checkbox"
import { subscribe } from "@zag-js/core"
import { createNormalizer } from "@zag-js/types"
import Alpine from "alpinejs"
import "../../../shared/src/style.css"

const propMap: any = {
  htmlFor: "for",
  className: "class",
  onDoubleClick: "onDblclick",
  onChange: "onInput",
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  defaultValue: "value",
  defaultChecked: "checked",
}

const toStyleString = (style: any) => {
  let string = ""
  for (let key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    string += `${key}:${value};`
  }
  return string
}

// all event handlers should use the format @click
const normalizeProps = createNormalizer((props: any) => {
  return Object.entries(props).reduce<any>((acc, [key, value]) => {
    if (value === undefined) return acc

    if (key in propMap) {
      key = propMap[key]
    }

    if (key === "style" && typeof value === "object") {
      acc.style = toStyleString(value)
      return acc
    }

    if (key.startsWith("on")) {
      const _key = key.replace(/^on/, "@").toLowerCase()
      acc[_key] = value
    } else {
      acc[`:${key.toLowerCase()}`] = () => value
    }

    return acc
  }, {})
})

document.addEventListener("alpine:init", () => {
  Alpine.magic("checkbox", (el, { Alpine, effect }) => (context: any) => {
    const service = checkbox.machine(context)

    const state = Alpine.reactive({ value: service.getState() })

    service.start()

    effect(() => {
      service.setContext(context)

      const unsubscribe = subscribe(service.state, () => {
        state.value = service.getState()
      })

      return () => {
        unsubscribe()
        service.stop()
      }
    })

    Alpine.bind(el, {
      "x-data"() {
        return {
          get api() {
            return checkbox.connect(state.value, service.send, normalizeProps)
          },
        }
      },
    })
  })
})

Alpine.start()
